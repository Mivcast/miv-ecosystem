/* One visitor-selected niche supplies every interactive tool. */
(()=>{
 const normalize=s=>String(s||'').normalize('NFD').replace(/\p{M}/gu,'').trim().replace(/\s+/g,' ').toLowerCase();
 const valid=s=>s.length>=3&&s.length<=100&&/^\p{L}[\p{L}\p{N} '&()./-]*$/u.test(s)&&!/https?:|www\.|\d{7}/i.test(s);
 const general='Visão geral para negócios',fields=['calNiche','regNiche','cpNiche','cpSubniche'];
 let revision=0,owner=null,generation=0,pending=null,hydrating=null,saveChain=Promise.resolve(),activeUser=mivUser?.id||'visitor';
 const originalApply=applyTheme,originalProfile=getCompanyProfile;
 const current=()=>state.profile.niche!==general&&valid(String(state.profile.niche||''))?state.profile.niche:'';
 function value(id){const n=current();return id==='cpNiche'?(niches[n]?.group||n):n;}
 function goHome(){document.getElementById('calendarModal')?.classList.remove('open');closeAuth();route('home');document.getElementById('nicho')?.scrollIntoView({behavior:'smooth',block:'center'});document.getElementById('nicheSearch')?.focus({preventScroll:true});}
 function requireNiche(resume){if(current())return true;pending=resume;goHome();toast('Escolha seu nicho no início para personalizar todas as ferramentas.');return false;}
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
   revision=result.revision;if(stamp!==generation)return;originalApply(result.niche,niches[result.niche]?.theme||'clean',false);refresh();
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
  originalApply(chosen,niches[chosen]?.theme||theme||'clean',scroll);refresh();persist(chosen,stamp);
  const resume=pending;pending=null;if(resume)setTimeout(resume,0);
 }
 async function hydrate(){
  const user=mivUser?.id;if(!user){owner=null;revision=0;return;}
  if(hydrating?.user===user)return hydrating.promise;
  const stamp=generation;const promise=(async()=>{
   const result=await request('niche-get');if(user!==mivUser?.id||stamp!==generation)return;
   owner=user;revision=result.revision;
   if(result.niche&&valid(result.niche)){originalApply(result.niche,niches[result.niche]?.theme||'clean',false);refresh();}
   else if(current())persist(current(),generation);
  })();hydrating={user,promise};try{await promise;}finally{if(hydrating?.promise===promise)hydrating=null;}
 }
 applyTheme=apply;
 getCompanyProfile=function(){const p=originalProfile();return {...p,niche:value('cpNiche'),subniche:current()};};
 function session(){const next=mivUser?.id||'visitor';if(next===activeUser)return;const before=activeUser,choice=current();localStorage.setItem('mivCanonicalNiche:'+before,choice);activeUser=next;generation++;owner=null;revision=0;pending=null;const saved=localStorage.getItem('mivCanonicalNiche:'+next),target=saved||(next!=='visitor'&&before==='visitor'?choice:'');originalApply(target&&valid(target)?target:general,niches[target]?.theme||'clean',false);refresh();}
 window.MivNiche={value,renderField,require:requireNiche,hydrate,current,normalize,session};
 document.getElementById('applyNiche').onclick=()=>apply(document.getElementById('nicheSearch').value,'clean',false);
 document.getElementById('doRegister')?.addEventListener('click',event=>{if(!requireNiche(()=>openAuth('register'))){event.preventDefault();event.stopImmediatePropagation();}},true);
 const calendar=openCalendar;openCalendar=async function(){if(!requireNiche(()=>openCalendar()))return;await calendar();refresh();};
 const readPrefs=readCalendarPrefs;readCalendarPrefs=function(){const p=readPrefs();return p.niche===current()?p:{...p,niche:current(),dynamicEvents:[],dynamicSources:[],dynamicUpdatedAt:null};};
 if(state.profile.niche!==general&&!valid(String(state.profile.niche||''))){state.profile.niche=general;state.profile.theme='clean';save();}
 refresh();
 if(/^https?:$/.test(location.protocol))fetch('/api/diagnoses?action=niches',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{
  for(const entry of data?.niches||[]){if(!valid(entry.name)||!valid(entry.category)||!['clean','medical','health','fitness','agency','retail','food','beauty','legal','construction','auto'].includes(entry.theme))continue;let group=groups.find(g=>g.name===entry.category);if(!group){group={name:entry.category,theme:entry.theme,subs:[]};groups.push(group);niches[group.name]={theme:entry.theme,group:group.name};}if(!group.subs.includes(entry.name))group.subs.push(entry.name);niches[entry.name]={theme:entry.theme,group:group.name};}refresh();
 }).catch(()=>{});
})();
