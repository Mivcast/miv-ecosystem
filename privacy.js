(() => {
 const cfg=window.MIV_LEGAL,esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const links='<a href="legal.html?doc=terms" target="_blank" rel="noopener">Termos de Uso</a> e <a href="legal.html?doc=privacy" target="_blank" rel="noopener">Política de Privacidade</a>';
 const labels={access:'Acesso / informação',correction:'Correção',deletion:'Exclusão',consent:'Revogação / métricas',refund:'Arrependimento / reembolso',support:'Atendimento'};
 const states={received:'Recebido',in_progress:'Em atendimento',completed:'Respondido'};
 let dialog=null,acceptedOwner=null,requestId=null;
 async function api(action,body,method='POST'){
  if(typeof mivSupabase==='undefined'||!mivSupabase)throw Error('A conexão ainda não está pronta.');
  const {data,error}=await mivSupabase.auth.getSession();if(error||!data.session?.access_token)throw Error('Entre na sua conta para continuar.');
  const r=await fetch('/api/diagnoses'+(method==='GET'?'?action='+action:''),{method,cache:'no-store',headers:{Authorization:'Bearer '+data.session.access_token,...(method==='POST'?{'Content-Type':'application/json'}:{})},...(method==='POST'?{body:JSON.stringify({action,...body})}:{})});
  const result=await r.json();if(!r.ok)throw Error(result.error||'Não foi possível concluir. Tente novamente ou use o atendimento.');return result;
 }
 function modal(title,body){
  dialog?.close();dialog?.remove();dialog=document.createElement('dialog');dialog.className='privacy-dialog';dialog.innerHTML=`<button type="button" class="outline privacy-close" aria-label="Fechar">×</button><h2>${title}</h2>${body}`;document.body.append(dialog);
  dialog.querySelector('.privacy-close').onclick=()=>dialog.close();dialog.showModal();return dialog;
 }
 async function ensureTerms(){
  const owner=typeof mivUser!=='undefined'?mivUser?.id:null;if(!owner){openAuth('login');return false;}
  if(acceptedOwner===owner)return true;
  try{if((await api('legal-status',null,'GET')).accepted){acceptedOwner=owner;return true;}}catch(e){toast(e.message);return false;}
  return new Promise(resolve=>{
   const d=modal('Antes de continuar',`<p>Confira as condições de acesso, cobrança, cancelamento e tratamento dos seus dados. A aceitação não inclui métricas opcionais nem publicidade.</p><p>${links}</p><label class="legal-check"><input id="checkoutTerms" type="checkbox">Li e aceito os Termos de Uso e estou ciente da Política de Privacidade, versão ${esc(cfg.version)}.</label><button type="button" class="primary" id="acceptCheckoutTerms">Aceitar e continuar</button><p role="status" id="termsStatus"></p>`);
   let result=false;d.addEventListener('close',()=>{resolve(result);d.remove();if(dialog===d)dialog=null;},{once:true});
   d.querySelector('#acceptCheckoutTerms').onclick=async()=>{
    const status=d.querySelector('#termsStatus');if(!d.querySelector('#checkoutTerms').checked){status.textContent='Marque a opção após ler os documentos.';return;}
    const button=d.querySelector('#acceptCheckoutTerms');button.disabled=true;
    try{await api('legal-accept',{accepted:true,version:cfg.version});if(mivUser?.id!==owner)throw Error('A conta mudou. Tente novamente.');acceptedOwner=owner;result=true;d.close();}catch(e){status.textContent=e.message;}finally{button.disabled=false;}
   };
  });
 }
 async function list(d){
  const target=d.querySelector('#privacyRequests');try{const {requests}=await api('privacy-list',null,'GET');if(!d.isConnected)return;target.innerHTML=requests.length?requests.map(r=>`<article class="privacy-request"><strong>${esc(labels[r.kind]||r.kind)} · ${esc(states[r.status]||r.status)}</strong><p>Protocolo ${esc(r.id)}<br>${esc(new Date(r.created_at).toLocaleString('pt-BR'))}</p><p>${esc(r.message)}</p>${r.response?`<p><strong>Resposta da equipe:</strong> ${esc(r.response)}</p>`:''}</article>`).join(''):'<p>Nenhuma solicitação registrada nesta conta.</p>';}catch(e){target.textContent=e.message;}
 }
 function open(){
  if(typeof mivUser==='undefined'||!mivUser){openAuth('login');toast('Entre na sua conta para acessar seus dados e protocolos.');return;}
  const owner=mivUser.id;
  const d=modal('Privacidade e meus dados',`<p>Você controla suas informações. Para corrigir o perfil da empresa, use também o formulário da Central.</p><div class="legal-links"><a href="legal.html?doc=privacy" target="_blank" rel="noopener">Privacidade</a><a href="legal.html?doc=support" target="_blank" rel="noopener">Atendimento e cancelamento</a></div><div class="privacy-actions"><button class="outline" id="privacyDownload" type="button">Baixar meus dados</button><button class="outline" id="privacyMetrics" type="button">Preferências de métricas</button></div><p class="privacy-note">A cópia contém informações privadas: guarde-a com cuidado. Pedidos de exclusão não cancelam automaticamente cobranças. Você pode solicitar as duas providências no mesmo protocolo. Não envie senhas, cartões ou dados de pacientes.</p><form id="privacyRequestForm"><h3>Registrar solicitação</h3><label for="privacyKind">Assunto</label><select id="privacyKind">${Object.entries(labels).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select><label for="privacyMessage">O que você precisa?</label><textarea id="privacyMessage" required minlength="10" maxlength="2000" rows="4"></textarea><button class="primary" type="submit">Enviar solicitação</button></form><p id="privacyStatus" role="status"></p><h3>Meus protocolos</h3><div id="privacyRequests">Carregando...</div>`);
  d.querySelector('#privacyMetrics').onclick=()=>{d.close();window.MivAnalytics?.preferences();};
  d.querySelector('#privacyDownload').onclick=async event=>{
   const button=event.currentTarget,status=d.querySelector('#privacyStatus');button.disabled=true;status.textContent='Preparando sua cópia...';
   try{const data=await api('privacy-export');if(mivUser?.id!==owner)throw Error('A conta mudou. Abra novamente.');const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='miv-meus-dados.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Cópia preparada. Verifique os downloads do navegador.';}catch(e){status.textContent=e.message;}finally{button.disabled=false;}
  };
  requestId=crypto.randomUUID();d.querySelector('form').onsubmit=async event=>{
   event.preventDefault();const button=d.querySelector('form button'),status=d.querySelector('#privacyStatus');button.disabled=true;
   try{if(mivUser?.id!==owner)throw Error('A conta mudou. Abra novamente.');const {request}=await api('privacy-request',{request_id:requestId,kind:d.querySelector('#privacyKind').value,message:d.querySelector('#privacyMessage').value});status.textContent='Pedido recebido. Protocolo: '+request.id+'. Acompanhe a resposta abaixo.';d.querySelector('#privacyMessage').value='';requestId=crypto.randomUUID();await list(d);}catch(e){status.textContent=e.message;}finally{button.disabled=false;}
  };list(d);
 }
 document.getElementById('doRegister')?.closest('.authActions')?.insertAdjacentHTML('beforebegin',`<label class="legal-check"><input id="regTerms" type="checkbox"> <span>Li e aceito os ${links}. As métricas opcionais são uma escolha separada.</span></label>`);
 document.querySelectorAll('[data-privacy-center]').forEach(b=>b.onclick=open);
 const footer=document.querySelector('.footerBrand');if(footer){const identity=document.createElement('p');identity.className='privacy-note';identity.textContent=[cfg.legalName,cfg.taxId,cfg.address,'Atendimento e privacidade: '+cfg.supportEmail].join(' · ');footer.append(identity);}
 const central=document.querySelector('#view-central .centralHero');if(central){const b=document.createElement('button');b.type='button';b.className='outline';b.textContent='Privacidade e meus dados';b.onclick=open;central.append(b);}
 document.getElementById('markForm')?.insertAdjacentHTML('beforebegin','<p class="privacy-note" style="margin:8px 16px">IA pode errar. Não envie senhas, dados de pacientes ou informações sensíveis de terceiros.</p>');
 window.addEventListener('miv-auth-session',()=>{acceptedOwner=null;dialog?.close();dialog?.remove();dialog=null;});
 window.MivPrivacy={open,ensureTerms,registration:()=>!!document.getElementById('regTerms')?.checked,api};
 const originalSubscription=startSubscription;startSubscription=async function(plan){if(mivUser&&!await ensureTerms())return;return originalSubscription(plan);};
})();
