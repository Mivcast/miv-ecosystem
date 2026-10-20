/* Optional navigation metrics. No form values, answers, chat text or URL query strings. */
(() => {
  if(!['https:','http:'].includes(location.protocol))return;
  const consentKey='mivAnalyticsConsent:v1',visitorKey='mivAnalyticsVisitor:v1',sessionKey='mivAnalyticsSession:v1';
  let queue=[],owner=null,generation=0,busy=false,request=null,flushTimer=null,lastPage='',epoch=0,scanPending=false,failures=0;
  const seen=new Set(),exposures=new Map();let observed=new WeakSet();
  const read=(storage,key)=>{try{return JSON.parse(storage.getItem(key)||'null');}catch{return null;}};
  const privacySignal=()=>navigator.globalPrivacyControl===true||navigator.doNotTrack==='1';
  const enabled=()=>!privacySignal()&&read(localStorage,consentKey)?.status==='accepted'&&['https:','http:'].includes(location.protocol);
  const clean=(value,max=100)=>String(value||'').toLowerCase().slice(0,max).replace(/[^a-z0-9:._-]/g,'');
  const safeCampaign=value=>/@|\d{6,}/.test(String(value||''))?'':clean(value);
  let attribution={source:'direct',campaign:''};
  try{
    const params=new URLSearchParams(location.search),source=params.get('utm_source');
    const ref=document.referrer?new URL(document.referrer):null;
    attribution={source:source?safeCampaign(source).slice(0,80)||'unknown':ref&&ref.host!==location.host?clean(ref.hostname,80):'direct',campaign:safeCampaign(params.get('utm_campaign'))};
  }catch{}
  function identity(){
    const now=Date.now();let visitor=read(localStorage,visitorKey),session=read(sessionStorage,sessionKey);
    if(!visitor?.id||visitor.expires<now){visitor={id:crypto.randomUUID(),expires:now+30*86400000};localStorage.setItem(visitorKey,JSON.stringify(visitor));}
    if(!session?.id||now-session.at>30*60000)session={id:crypto.randomUUID(),at:now,attribution};
    if(session.attribution)attribution=session.attribution;else session.attribution=attribution;
    session.at=now;sessionStorage.setItem(sessionKey,JSON.stringify(session));return {visitor_id:visitor.id,session_id:session.id};
  }
  function context(){
    if(!enabled())return {consent:false};
    try{return {consent:true,...identity(),...attribution,niche:String(state.profile.niche||'').slice(0,160),device:innerWidth<=700?'mobile':innerWidth<=1023?'tablet':'desktop'};}catch{return {consent:false};}
  }
  function track(name,itemId=''){
    if(!enabled())return;
    try{
      const nextOwner=typeof mivUser!=='undefined'?mivUser?.id||null:null;
      if(owner!==nextOwner){queue=[];sessionStorage.removeItem(sessionKey);owner=nextOwner;}
      const ctx=context();if(!ctx.consent)return;
      if(queue.length&&queue[0].session_id!==ctx.session_id)queue=[];
      queue.push({event_id:crypto.randomUUID(),...ctx,name,item_id:clean(itemId,140),page:['home','detail','central','report'].includes(state.route)?state.route:'home'});
      if(queue.length>100)queue=queue.slice(-100);
      clearTimeout(flushTimer);flushTimer=setTimeout(flush,1500);
    }catch{}
  }
  async function flush(){
    if(!enabled()||busy||!queue.length)return;
    busy=true;const version=generation,batch=queue.splice(0,20),batchOwner=owner;
    try{
      let token='';
      if(batchOwner&&typeof mivSupabase!=='undefined'&&mivSupabase){const {data}=await mivSupabase.auth.getSession();if(data?.session?.user?.id!==batchOwner)return;token=data.session.access_token;}
      if(!enabled()||version!==generation||batchOwner!==(mivUser?.id||null))return;
      request=new AbortController();
      const response=await fetch('/api/diagnoses',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify({action:'analytics-events',consent:true,events:batch.map(({consent,...event})=>event)}),signal:request.signal,keepalive:true});
      if(response.status>=500&&version===generation){failures++;queue=[...batch,...queue].slice(0,100);}else failures=0;
    }catch{if(enabled()&&version===generation){failures++;queue=[...batch,...queue].slice(0,100);}}
    finally{request=null;busy=false;if(enabled()&&queue.length)flushTimer=setTimeout(flush,Math.min(60000,5000*2**Math.min(failures,4)));}
  }
  function pageView(){
    const key=state.route+':'+(state.current?.id||'')+':'+state.profile.niche;
    if(key===lastPage)return;lastPage=key;epoch++;track('page_view',state.route==='detail'?state.current?.id||'':'');scan();
  }
  function idFor(article){
    const open=article.querySelector('[data-open]');if(open)return open.dataset.open;
    const point=article.querySelector('[data-ev-solve]')?.dataset.evSolve;
    if(point){const card=EVOLUTION_DATA.flatMap(s=>s.cards).find(c=>c.qs.some(q=>q.id===point));return card?'diagnosis:'+card.id:'';}
    const channel=article.querySelector('[data-competitor-channel]')?.dataset.competitorChannel;
    return channel?'channel:'+clean(channel):'';
  }
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{
    for(const entry of entries){
      clearTimeout(exposures.get(entry.target));exposures.delete(entry.target);
      if(!entry.isIntersecting||entry.intersectionRatio<0.5||!enabled())continue;
      const article=entry.target.closest('article'),id=article&&idFor(article),key=epoch+':'+state.profile.niche+':'+id;
      if(!id||seen.has(key))continue;
      exposures.set(entry.target,setTimeout(()=>{exposures.delete(entry.target);if(!entry.target.isConnected||document.hidden||!enabled())return;seen.add(key);track('card_view',id);},1000));
    }
  },{threshold:[0,0.5]}):null;
  function scan(){
    if(!enabled()||!observer||scanPending)return;scanPending=true;
    requestAnimationFrame(()=>{
      scanPending=false;if(!enabled())return;
      document.querySelectorAll('.shelf>article,.ev-card,.centralCarousel>article').forEach(article=>{
        const target=article.querySelector('.cardImg,.ev-visual,.market-card-body h3,.mivcastServicePhoto')||article;
        if(!observed.has(target)){observed.add(target);observer.observe(target);}
      });
    });
  }
  function choose(status){
    generation++;queue=[];clearTimeout(flushTimer);request?.abort();observer?.disconnect();
    exposures.forEach(clearTimeout);exposures.clear();lastPage='';
    try{localStorage.setItem(consentKey,JSON.stringify({status,at:Date.now()}));if(status!=='accepted'){localStorage.removeItem(visitorKey);sessionStorage.removeItem(sessionKey);}}catch{}
    document.getElementById('analyticsConsent')?.remove();
    if(enabled()){observed=new WeakSet();pageView();}
  }
  function preferences(){
    document.getElementById('analyticsConsent')?.remove();
    const box=document.createElement('aside');box.id='analyticsConsent';box.className='analytics-consent';box.setAttribute('aria-label','Preferências de navegação');
    box.innerHTML='<strong>Podemos melhorar sua experiência?</strong><p>Com sua permissão, medimos visitas e cliques para melhorar o MIV. Não coletamos textos das análises ou conversas. Você pode mudar sua escolha no rodapé.</p><div><button type="button" class="outline" data-analytics-reject>Não permitir</button><button type="button" class="primary" data-analytics-accept>Permitir métricas</button></div>';
    if(privacySignal())box.querySelector('p').textContent='Seu navegador pediu para não ser rastreado. Respeitamos essa preferência e a coleta de navegação permanece desativada.';
    box.querySelector('[data-analytics-reject]').onclick=()=>choose('declined');box.querySelector('[data-analytics-accept]').onclick=()=>choose('accepted');
    box.querySelector('[data-analytics-accept]').disabled=privacySignal();document.body.append(box);
  }
  window.addEventListener('click',event=>{
    const button=event.target.closest('button,[data-open]');if(!button||!enabled())return;
    if(button.dataset.open)track('card_click',button.dataset.open);
    if(button.dataset.evSolve)track('card_click','point:'+button.dataset.evSolve);
    if(button.dataset.fav&&!state.favorites.includes(button.dataset.fav))track('favorite_add',button.dataset.fav);
    if(button.dataset.competitorChannel)track('market_search','channel:'+clean(button.dataset.competitorChannel));
    if(button.id==='markFab'&&!document.getElementById('mark')?.classList.contains('open'))track('mark_open',state.current?.id||'');
  },true);
  function wrap(name,after){const original=window[name];if(typeof original!=='function')return;window[name]=function(...args){const result=original.apply(this,args);try{after(...args);}catch{}return result;};}
  wrap('route',pageView);wrap('applyTheme',pageView);
  wrap('addHistory',item=>{if(item?.id)track('card_open',item.id);});
  wrap('openMonthlyPlanModal',()=>track('tool_open','monthly-strategy-plan'));
  wrap('openCalendar',()=>track('tool_open','tool-calendario'));
  const complete=window.MivEvolution?.openComplete;
  if(complete)window.MivEvolution.openComplete=function(...args){const result=complete(...args);if(mivUser)track('analysis_start','complete');return result;};
  new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)flush();else scan();});
  window.addEventListener('storage',event=>{
    if(event.key!==consentKey)return;generation++;queue=[];request?.abort();observer?.disconnect();sessionStorage.removeItem(sessionKey);observed=new WeakSet();lastPage='';
    if(enabled())pageView();
  });
  const footer=document.querySelector('.footerBottom')||document.querySelector('.siteFooter');
  if(footer){const button=document.createElement('button');button.type='button';button.className='analytics-preferences';button.textContent='Preferências de métricas';button.onclick=preferences;footer.append(button);}
  window.MivAnalytics={track,context,flush,preferences};
  if(!privacySignal()&&!read(localStorage,consentKey))preferences();else if(enabled())pageView();
})();
