/* One visitor-selected niche supplies every interactive tool. */
(()=>{
 const normalize=s=>String(s||'').normalize('NFD').replace(/\p{M}/gu,'').trim().replace(/\s+/g,' ').toLowerCase();
 const valid=s=>s.length>=3&&s.length<=100&&/^\p{L}[\p{L}\p{N} '&()./-]*$/u.test(s)&&!/https?:|www\.|\d{7}/i.test(s);
 const general='Visão geral para negócios',fields=['calNiche','regNiche','cpNiche','cpSubniche'];
 let revision=0,owner=null,generation=0,pending=null,hydrating=null,saveChain=Promise.resolve(),activeUser=mivUser?.id||'visitor';
 const originalApply=applyTheme,originalProfile=getCompanyProfile;
 const current=()=>state.profile.niche!==general&&valid(String(state.profile.niche||''))?state.profile.niche:'';
 function value(id){const n=current()||general;return id==='cpNiche'?(niches[n]?.group||n):n;}
 function goHome(){document.getElementById('calendarModal')?.classList.remove('open');closeAuth();route('home');document.getElementById('nicho')?.scrollIntoView({behavior:'smooth',block:'center'});document.getElementById('nicheSearch')?.focus({preventScroll:true});}
 let baseAccepted = sessionStorage.getItem('mivGeneralExperience') === '1';
 let replaying = false;
 const welcome = document.createElement('dialog');
 welcome.className = 'niche-welcome';
 welcome.setAttribute('aria-labelledby', 'nicheWelcomeTitle');
 welcome.innerHTML = `
  <div class="niche-welcome-layout">
   <img class="niche-welcome-photo" src="assets/cards/consult-completa.jpg" alt="Profissionais em um encontro de orientação empresarial">
   <div class="niche-welcome-copy">
    <button type="button" class="outline niche-welcome-dismiss" aria-label="Fechar convite">×</button>
    <span class="eyebrow">UMA EXPERIÊNCIA QUE MUDA COM VOCÊ</span>
    <h2 id="nicheWelcomeTitle">Seu negócio merece uma experiência mais próxima da sua realidade.</h2>
    <p>Escolha seu nicho para direcionar as análises, ferramentas e recomendações. Você também pode continuar com a experiência geral.</p>
    <form id="nicheWelcomeForm">
     <label for="welcomeNiche">Qual é sua atividade?</label>
     <input id="welcomeNiche" list="nicheList" maxlength="100" placeholder="Ex.: restaurante, loja de roupas, numismática">
     <details>
      <summary>Quer receber orientações pelo WhatsApp? (opcional)</summary>
      <label for="welcomeName">Seu nome (opcional)</label>
      <input id="welcomeName" autocomplete="given-name" maxlength="100">
      <label for="welcomePhone">WhatsApp com DDD (opcional)</label>
      <input id="welcomePhone" type="tel" autocomplete="tel" maxlength="25" placeholder="(11) 99999-9999">
      <label class="consent-line"><input id="welcomeConsent" type="checkbox"><span>Autorizo a MivCast a entrar em contato pelo WhatsApp com orientações, novidades e ofertas. Posso cancelar essa autorização pelo atendimento.</span></label>
      <a href="legal.html#privacy" target="_blank" rel="noopener">Política de Privacidade</a>
     </details>
     <p id="welcomeStatus" role="status"></p>
     <div class="niche-welcome-actions">
      <button type="submit" class="primary">Personalizar minha experiência</button>
      <button type="button" class="outline" id="welcomeGeneral">Continuar com a experiência geral</button>
     </div>
    </form>
   </div>
  </div>`;
 document.body.append(welcome);
 let requestId = crypto.randomUUID();
 const message = welcome.querySelector('#welcomeStatus');
 function resumeAction() {
  const callback = pending;
  pending = null;
  welcome.close();
  welcome.querySelector('form').reset();
  message.textContent = '';
  requestId = crypto.randomUUID();
  if (!callback) return;
  replaying = true;
  try { callback(); }
  finally { replaying = false; }
 }
 async function captureContact() {
  const phone = welcome.querySelector('#welcomePhone').value.trim();
  const consent = welcome.querySelector('#welcomeConsent').checked;
  if (!phone && !consent) return;
  if (!phone || !consent) throw Error('Para receber contato, informe seu WhatsApp e marque a autorização. Você pode deixar ambos em branco.');
  const response = await fetch('/api/diagnoses', {
   method: 'POST', signal: AbortSignal.timeout(15000),
   headers: {'Content-Type':'application/json'},
   body: JSON.stringify({
    action:'lead-opt-in', request_id:requestId,
    name:welcome.querySelector('#welcomeName').value.trim(), phone,
    niche:welcome.querySelector('#welcomeNiche').value.trim(),
    consent:true, consent_version:'whatsapp-v1'
   })
  });
  if (!response.ok) throw Error('Não foi possível registrar o contato. Tente novamente ou limpe o telefone e a autorização para continuar.');
 }
 async function choose(generalExperience) {
  const field = welcome.querySelector('#welcomeNiche');
  const choice = field.value.normalize('NFC').trim().replace(/\s+/g, ' ');
  if (!generalExperience && !valid(choice)) {
   message.textContent = 'Digite o nome da sua atividade para personalizar ou continue com a experiência geral.';
   field.focus();
   return;
  }
  const buttons = [...welcome.querySelectorAll('button')];
  buttons.forEach(button => button.disabled = true);
  try {
   await captureContact();
   if (generalExperience) {
    baseAccepted = true;
    sessionStorage.setItem('mivGeneralExperience', '1');
    resumeAction();
    return;
   }
   // Applying a niche already resumes existing pending tools. Resume this dialog once.
   const callback = pending;
   pending = null;
   apply(choice, 'clean', false);
   pending = callback;
   if (current()) resumeAction();
  } catch (error) { message.textContent = error.message; }
  finally { buttons.forEach(button => button.disabled = false); }
 }
 welcome.querySelector('form').onsubmit = event => { event.preventDefault(); choose(false); };
 welcome.querySelector('#welcomeGeneral').onclick = () => choose(true);
 welcome.querySelector('.niche-welcome-dismiss').onclick = () => welcome.close();
 welcome.addEventListener('close', () => {
  pending = null;
  welcome.querySelector('form').reset();
  message.textContent = '';
  requestId = crypto.randomUUID();
 });
 function requireNiche(resume) {
  if (current() || baseAccepted || replaying) return true;
  pending = resume;
  if (!welcome.open) welcome.showModal();
  return false;
 }
 function offerForEvent(event) {
  const action = event.target.closest('[data-open],[data-analysis],[data-sub],[data-quick-start],[data-home-stage],[data-v14-analysis],[data-v14-consult],[data-route="analises"],.hero-paths button,#refreshTrends,#refreshCompetitors,#calRefreshResearch,#calSaveImportant,#calPrev,#calNext,#calToday,.calDay,#needSuggest,#markFab');
  if (!action || action.closest('dialog')) return false;
  if (requireNiche(() => action.click())) return false;
  event.preventDefault();
  event.stopImmediatePropagation();
  return true;
 }
 function renderField(id){
  const el=document.getElementById(id);if(!el)return;
  const option=document.createElement('option');option.value=value(id);option.textContent=value(id)||'Escolha seu nicho no início';el.replaceChildren(option);el.disabled=true;
  const other=otherInputFor(id);if(other){other.hidden=true;other.value='';}
  if(!el.parentElement.querySelector(`[data-niche-edit="${id}"]`)){const b=document.createElement('button');b.type='button';b.className='canonical-niche-note';b.dataset.nicheEdit=id;b.textContent='Alterar nicho no início';b.onclick=goHome;el.after(b);}
 }
 function refresh(){fields.forEach(renderField);window.MivEvolution?.renderNichePicker();const list=document.getElementById('nicheList');if(list&&!window.MivEvolution)list.replaceChildren(...Object.keys(niches).map(n=>{const o=document.createElement('option');o.value=n;return o;}));}
 async function request(action,body){
  const {data}=await mivSupabase.auth.getSession(),token=data?.session?.access_token;if(!token)throw Error('Entre novamente para sincronizar seu nicho.');
  const r=await fetch('/api/diagnoses'+(body?'':'?action='+action),{method:body?'POST':'GET',cache:'no-store',headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify({action,...body})}:{})});
  const result=await r.json();if(!r.ok)throw Object.assign(Error(result.error||'Não foi possível sincronizar seu nicho.'),{status:r.status});return result;
 }
 function persist(niche,stamp){
  const user=mivUser?.id;if(!user)return;
  saveChain=saveChain.catch(()=>{}).then(async()=>{
   if(user!==mivUser?.id||stamp!==generation)return;
   if(owner!==user){const existing=await request('niche-get');if(user!==mivUser?.id||stamp!==generation)return;owner=user;revision=existing.revision;}
   const result=await request('niche-set',{niche,revision});if(user!==mivUser?.id)return;
   revision=result.revision;if(stamp!==generation)return;originalApply(result.niche,niches[result.niche]?.theme||'clean',false);refresh();openCalendar(true);
   if(result.status==='pending')toast('Seu nicho já pode ser usado. A inclusão no catálogo público será revisada.');
  }).catch(error=>{if(user===mivUser?.id&&stamp===generation){if(error.status===409)owner=null;toast(error.message+' Sua escolha neste navegador foi mantida.');}});
 }
 function apply(niche,theme,scroll){
  const entered=String(niche||'').normalize('NFC').trim().replace(/\s+/g,' ');
  if(entered===general){originalApply(general,'clean',scroll);refresh();return;}
  if(!valid(entered)){toast('Informe apenas o nome da sua atividade, sem links ou dados pessoais.');return;}
  const match=Object.keys(niches).find(n=>normalize(n)===normalize(entered));
  if(!match&&!window.confirm(`Usar “${entered}” como sua atividade? Confira a grafia. O nome será revisado antes de aparecer no catálogo público.`))return;
  const chosen=match||entered;generation++;const stamp=generation;
  originalApply(chosen,niches[chosen]?.theme||theme||'clean',scroll);refresh();openCalendar(true);persist(chosen,stamp);
  const resume=pending;pending=null;if(resume)setTimeout(resume,0);
 }
 async function hydrate(){
  const user=mivUser?.id;if(!user){owner=null;revision=0;return;}
  if(hydrating?.user===user)return hydrating.promise;
  const stamp=generation;const promise=(async()=>{
   const result=await request('niche-get');if(user!==mivUser?.id||stamp!==generation)return;
   owner=user;revision=result.revision;
   if(result.niche&&valid(result.niche)){originalApply(result.niche,niches[result.niche]?.theme||'clean',false);refresh();openCalendar(true);}
   else if(current())persist(current(),generation);
  })();hydrating={user,promise};try{await promise;}finally{if(hydrating?.promise===promise)hydrating=null;}
 }
 applyTheme=apply;
 getCompanyProfile=function(){const p=originalProfile();return {...p,niche:value('cpNiche'),subniche:value('cpSubniche')};};
 function session(){const next=mivUser?.id||'visitor';if(next===activeUser)return;const before=activeUser,choice=current();localStorage.setItem('mivCanonicalNiche:'+before,choice);activeUser=next;generation++;owner=null;revision=0;pending=null;const saved=localStorage.getItem('mivCanonicalNiche:'+next),target=saved||(next!=='visitor'&&before==='visitor'?choice:'');originalApply(target&&valid(target)?target:general,niches[target]?.theme||'clean',false);refresh();}
 window.MivNiche={value,renderField,require:requireNiche,offerForEvent,hydrate,current,normalize,session};
 document.getElementById('applyNiche').onclick=()=>apply(document.getElementById('nicheSearch').value,'clean',false);
 document.getElementById('doRegister')?.addEventListener('click',event=>{if(!requireNiche(()=>openAuth('register'))){event.preventDefault();event.stopImmediatePropagation();}},true);
 const calendar=openCalendar;openCalendar=async function(inline=false){if(!inline&&!requireNiche(()=>openCalendar()))return;await calendar(inline);refresh();};
 const readPrefs=readCalendarPrefs;readCalendarPrefs=function(){const p=readPrefs(),niche=value('calNiche');return p.niche===niche?p:{...p,niche,dynamicEvents:[],dynamicSources:[],dynamicUpdatedAt:null};};
 if(state.profile.niche!==general&&!valid(String(state.profile.niche||''))){state.profile.niche=general;state.profile.theme='clean';save();}
 refresh();
 if(/^https?:$/.test(location.protocol))fetch('/api/diagnoses?action=niches',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{
  for(const entry of data?.niches||[]){if(!valid(entry.name)||!valid(entry.category)||!['clean','medical','health','fitness','agency','retail','food','beauty','legal','construction','auto'].includes(entry.theme))continue;let group=groups.find(g=>g.name===entry.category);if(!group){group={name:entry.category,theme:entry.theme,subs:[]};groups.push(group);niches[group.name]={theme:entry.theme,group:group.name};}if(!group.subs.includes(entry.name))group.subs.push(entry.name);niches[entry.name]={theme:entry.theme,group:group.name};}refresh();
 }).catch(()=>{});
})();
