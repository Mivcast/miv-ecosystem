window.MivAdminSecurity=(() => {
 let pending=null;
 function qrImageSource(value){
  if(typeof value!=='string')throw Error('QR code indisponível. Feche e tente novamente.');
  let svg=value.trim();
  // Supabase JS prefixes the raw SVG with a data URL; normalize the payload once.
  if(/^data:image\/svg\+xml[;,]/i.test(svg)){
   const comma=svg.indexOf(','),header=svg.slice(0,comma);
   svg=svg.slice(comma+1);
   if(/;base64$/i.test(header))svg=atob(svg);
   else if(/^%3c/i.test(svg.trim()))svg=decodeURIComponent(svg);
  }
  const document=new DOMParser().parseFromString(svg,'image/svg+xml');
  if(document.doctype||document.querySelector('parsererror')||document.documentElement.localName!=='svg'||document.documentElement.namespaceURI!=='http://www.w3.org/2000/svg')throw Error('QR code inválido. Feche e tente novamente.');
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
 }
 async function verify(sb,enroll=false){
  if(pending)return pending;
  if(!sb.auth.mfa)throw Error('Atualize a página para carregar a autenticação segura.');
  const {data:levels,error}=await sb.auth.mfa.getAuthenticatorAssuranceLevel();if(error)throw error;
  if(!enroll&&(levels.currentLevel==='aal2'||levels.nextLevel!=='aal2'))return true;
  pending=new Promise(async resolve=>{
   const dialog=document.createElement('dialog');dialog.className='privacy-dialog';dialog.innerHTML='<button class="privacy-close secondary" type="button" aria-label="Fechar">×</button><h2>Proteja seu painel</h2><p id="mfaInstruction"></p><div id="mfaQr"></div><form><label for="mfaCode">Código do aplicativo autenticador</label><input id="mfaCode" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required><div class="privacy-actions"><button class="primary" type="submit">Confirmar código</button></div></form><p id="mfaStatus" role="status"></p>';
   document.body.append(dialog);dialog.showModal();let confirmed=false,factorId=null;
   dialog.querySelector('.privacy-close').onclick=()=>dialog.close();
   dialog.addEventListener('close',()=>{dialog.remove();pending=null;resolve(confirmed);},{once:true});
   try{
    if(enroll){
     const {data:factors,error:listError}=await sb.auth.mfa.listFactors();if(listError)throw listError;
     if(factors.totp?.some(f=>f.status==='verified')){dialog.querySelector('#mfaInstruction').textContent='Esta conta já tem um autenticador verificado. Use-o para confirmar.';factorId=factors.totp.find(f=>f.status==='verified').id;}
     else{
      for(const old of factors.all||[])if(old.factor_type==='totp'&&old.status==='unverified')await sb.auth.mfa.unenroll({factorId:old.id});
      const {data,error:enrollError}=await sb.auth.mfa.enroll({factorType:'totp',friendlyName:'MIV Admin'});if(enrollError)throw enrollError;factorId=data.id;
      dialog.querySelector('#mfaInstruction').textContent='Adicione este QR code ao seu aplicativo autenticador. Guarde o acesso ao aplicativo com segurança. Não compartilhe o QR code ou os códigos. A proteção só é ativada após confirmar um código válido.';
      const img=document.createElement('img');img.alt='QR code para configurar o autenticador';img.width=220;img.height=220;img.onerror=()=>{dialog.querySelector('#mfaStatus').textContent='Não foi possível exibir o QR code. Feche e tente novamente.';};img.src=qrImageSource(data.totp?.qr_code);dialog.querySelector('#mfaQr').append(img);
     }
    }else{const {data,error:listError}=await sb.auth.mfa.listFactors();if(listError)throw listError;factorId=data.totp?.find(f=>f.status==='verified')?.id;dialog.querySelector('#mfaInstruction').textContent='Informe o código do seu aplicativo autenticador para acessar os dados administrativos.';}
    if(!factorId)throw Error('Autenticador não encontrado. Solicite recuperação pelo responsável.');
    dialog.querySelector('form').onsubmit=async event=>{
     event.preventDefault();const button=dialog.querySelector('form button'),status=dialog.querySelector('#mfaStatus');button.disabled=true;
     try{const {error}=await sb.auth.mfa.challengeAndVerify({factorId,code:dialog.querySelector('#mfaCode').value});if(error)throw error;confirmed=true;dialog.close();}catch{status.textContent='Não foi possível validar. Confira o código e o horário do autenticador.';}finally{button.disabled=false;}
    };
   }catch(e){dialog.querySelector('#mfaStatus').textContent=e.message||'Não foi possível preparar o autenticador.';dialog.querySelector('form').hidden=true;}
  });return pending;
 }
 function bind(sb){let button=document.getElementById('adminMfaSetup');if(!button){button=document.createElement('button');button.id='adminMfaSetup';button.className='secondary';button.textContent='Proteger acesso (2 fatores)';document.querySelector('.topActions').prepend(button);}button.onclick=async()=>{try{if(await verify(sb,true)){button.textContent='Autenticador verificado';alert('Autenticador verificado. Nas próximas sessões, confirme o segundo fator para acessar o painel.');}}catch{alert('Não foi possível preparar a proteção. Tente novamente.');}};}
 return {verify,bind};
})();
