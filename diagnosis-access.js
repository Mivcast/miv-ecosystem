/* Rights come from the server. Local storage contains drafts only, never entitlements. */
(() => {
  let snapshot=null,loading=null,message='Suas respostas estão neste navegador.',failed=false;
  const jobs=new Map(),timers=new Map(),inFlight=new Map();
  const context=()=>({user:mivUser?.id||null,company_id:mivActiveCompanyId||null,niche:state.profile.niche,
    key:['mivEvolution:v2',mivUser?.id||'visitor',mivActiveCompanyId||'business',state.profile.niche].join(':')});
  const same=ctx=>context().key===ctx.key;
  const pendingKey=ctx=>'mivDiagnosisPending:'+ctx.key;
  const pending=ctx=>{try{const data=JSON.parse(localStorage.getItem(pendingKey(ctx))||'{}');return data&&typeof data==='object'&&!Array.isArray(data)?data:{}}catch{return {}}};
  function status(text,error=false){message=text;failed=error;renderStatus();}
  async function publicRules(){
    try{
      const response=await fetch('/api/diagnoses?action=rules',{cache:'no-store'});if(!response.ok)return;
      const {rules}=await response.json();if(!Number.isInteger(rules?.free_solution_limit)||!Number.isInteger(rules?.card_price_cents))return;
      document.querySelectorAll('[data-diagnosis-free-count]').forEach(el=>el.textContent=rules.free_solution_limit);
      document.querySelectorAll('[data-diagnosis-card-price]').forEach(el=>el.textContent=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(rules.card_price_cents/100));
      document.querySelectorAll('[data-diagnosis-mark-plan]').forEach(el=>{
        const enabled=el.dataset.diagnosisMarkPlan==='premium'?rules.premium_mark_enabled:rules.pro_mark_enabled;
        el.textContent=enabled?'Inclui MARK para aprofundar as análises.':'MARK nos demais recursos, sem consulta nas análises.';
      });
    }catch{}
  }
  function renderStatus(){
    const el=document.getElementById('evCloudStatus');if(!el)return;
    el.replaceChildren(document.createTextNode(message));el.setAttribute('role',failed?'alert':'status');
    if(failed){const button=document.createElement('button');button.type='button';button.textContent='Tentar novamente';button.onclick=()=>hydrate(true).then(()=>flush()).catch(()=>{});el.append(' ',button);}
  }
  async function request(ctx,body=null,query={}){
    if(!ctx.user||!mivSupabase)throw new Error('Entre na sua conta para salvar na Central.');
    const {data,error}=await mivSupabase.auth.getSession();if(error)throw error;
    if(data?.session?.user?.id!==ctx.user||!data.session.access_token)throw new Error('Sua conta mudou. Entre novamente para continuar.');
    const values={niche:ctx.niche,company_id:ctx.company_id||'',...query};
    const response=await fetch('/api/diagnoses'+(body?'':'?'+new URLSearchParams(values)),{
      method:body?'POST':'GET',headers:{'Content-Type':'application/json',Authorization:'Bearer '+data.session.access_token},
      ...(body?{body:JSON.stringify({...values,...body})}:{}),cache:'no-store'});
    const result=await response.json().catch(()=>({}));
    if(!response.ok&&response.status!==402)throw new Error(result.error||'Não foi possível salvar na Central.');
    return result;
  }
  function writePending(ctx,data){localStorage.setItem(pendingKey(ctx),JSON.stringify(data));}
  function normalize(value){return {answer:value.answer??null,note:String(value.note||''),naReason:value.answer==='na'?String(value.naReason||''):''};}
  function queue(data){
    const ctx=context();if(!ctx.user)return;
    try{
      const changes=pending(ctx),known=snapshot?.key===ctx.key?snapshot.workspace?.data||{}:{};
      for(const section of EVOLUTION_DATA)for(const card of section.cards)for(const point of card.qs){
        const value=data[point.id];if(!value)continue;
        const normalized=normalize(value);
        if(inFlight.get(ctx.key)===point.id||JSON.stringify(normalized)!==JSON.stringify(normalize(known[point.id]||{})))changes[point.id]=normalized;
        else delete changes[point.id];
      }
      writePending(ctx,changes);
      clearTimeout(timers.get(ctx.key));timers.set(ctx.key,setTimeout(()=>hydrate().then(()=>flush(ctx)).catch(()=>{}),450));
      if(Object.keys(changes).length)status('Respostas preservadas neste navegador. Salvando na Central…');
    }catch{status('Sem espaço para guardar o rascunho. Suas alterações ainda não foram confirmadas.',true);}
  }
  async function hydrate(force=false){
    const ctx=context();
    if(!ctx.user){snapshot=null;status('Respostas neste navegador. Entre na sua conta para salvar na Central.');return null;}
    if(snapshot?.key===ctx.key&&!force)return snapshot;
    if(loading?.key===ctx.key)return loading.promise;
    const promise=(async()=>{
      try{
        const result=await request(ctx);if(!same(ctx))return null;
        const local=window.MivEvolution?.localData()||{},draft=pending(ctx),cloud=result.workspace?.data||{};
        // Only account-scoped drafts are imported; visitor/other-account data is never copied silently.
        for(const section of EVOLUTION_DATA)for(const card of section.cards)for(const point of card.qs){
          if(local[point.id]&&!cloud[point.id]&&!draft[point.id])draft[point.id]=normalize(local[point.id]);
        }
        writePending(ctx,draft);snapshot={...result,key:ctx.key};
        window.MivEvolution?.restoreCloud({...local,...cloud,...draft});
        status(Object.keys(draft).length?'Rascunhos preservados. Sincronizando com a Central…':'Respostas sincronizadas com a sua Central.');
        if(Object.keys(draft).length)setTimeout(()=>flush(ctx).catch(()=>{}),0);
        return snapshot;
      }catch(error){if(same(ctx)){snapshot=null;status(error.message+' O rascunho local foi preservado.',true);}throw error;}
      finally{if(loading?.key===ctx.key)loading=null;}
    })();loading={key:ctx.key,promise};return promise;
  }
  async function flush(ctx=context()){
    clearTimeout(timers.get(ctx.key));
    if(jobs.has(ctx.key))return jobs.get(ctx.key);
    const job=(async()=>{
      await Promise.resolve();
      try{
        if(!ctx.user)throw new Error('Entre na sua conta para salvar na Central.');
        while(same(ctx)){
          const values=pending(ctx),entry=Object.entries(values)[0];if(!entry)break;
          const [point_id,data]=entry;
          inFlight.set(ctx.key,point_id);
          const saved=await request(ctx,{action:'save',point_id,data});
          inFlight.delete(ctx.key);
          const next=pending(ctx);if(JSON.stringify(next[point_id])===JSON.stringify(data))delete next[point_id];writePending(ctx,next);
          if(snapshot?.key===ctx.key)snapshot.workspace=saved.workspace;
        }
        if(!same(ctx))throw new Error('Sua conta ou nicho mudou. O rascunho anterior foi preservado.');
        status('Respostas salvas na sua Central.');
      }catch(error){if(same(ctx))status(error.message+' Tente sincronizar novamente.',true);throw error;}
      finally{inFlight.delete(ctx.key);jobs.delete(ctx.key);}
    })();jobs.set(ctx.key,job);return job;
  }
  function solution(id){return snapshot?.key===context().key?snapshot.solutions?.[id]:null;}
  async function unlock(id,consume=false){
    const ctx=context();await hydrate();
    const result=await request(ctx,{action:'unlock',point_id:id,consume_free:consume});
    if(!same(ctx))throw new Error('Seu perfil mudou. Abra a solução novamente.');
    snapshot={...snapshot,...result,solutions:{...snapshot.solutions,...(result.solution?{[id]:result.solution}:{})}};
    return result;
  }
  function saleItem(id){
    const cardId=String(id).replace(/^diagnosis:/,'');
    const card=EVOLUTION_DATA.flatMap(s=>s.cards).find(c=>c.id===cardId);if(!card)return null;
    const cents=snapshot?.key===context().key?(snapshot.card_price_cents??snapshot.rules?.card_price_cents):null;
    return {id:'diagnosis:'+cardId,title:'Análise · '+card.title,access:'Pago',special:'diagnosis',
      price:Number.isInteger(cents)?new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100):'Consultar valor'};
  }
  async function saveReport(){
    const ctx=context();await hydrate();await flush(ctx);
    const result=await request(ctx,{action:'report',report_id:crypto.randomUUID()});
    if(!same(ctx))return;
    state.reports.unshift(result.report);save();maybeRenderCentral();toast('Relatório salvo na sua Central.');
    return result.report;
  }
  async function renderCentral(){
    const host=document.getElementById('centralDiagnoses');if(!host||!mivUser)return;
    const ctx=context();host.textContent='Carregando análises salvas…';
    try{
      const result=await request(ctx,null,{action:'list'});if(!same(ctx))return;
      host.innerHTML=result.workspaces.length?result.workspaces.map((row,index)=>{
        const count=Object.values(row.data||{}).filter(value=>[0,1,2,'na'].includes(value?.answer)).length;
        return `<article class="centralMiniCard"><small>MAPA DE EVOLUÇÃO</small><h3>${markEsc(row.niche)}</h3><p>${count} de 60 pontos respondidos · ${new Date(row.updated_at).toLocaleDateString('pt-BR')}</p>${row.company_id===ctx.company_id?`<button class="outline" data-diagnosis-continue="${index}">Continuar análise</button>`:'<p>Vinculada a outro perfil da empresa.</p>'}</article>`;
      }).join(''):'<div class="empty">Ao responder às etapas com sua conta conectada, suas análises aparecerão aqui.</div>';
      host.querySelectorAll('[data-diagnosis-continue]').forEach(button=>button.onclick=()=>{
        const row=result.workspaces[Number(button.dataset.diagnosisContinue)];route('home');applyTheme(row.niche,niches[row.niche]?.theme||state.profile.theme,false);
        hydrate(true).catch(()=>{});document.getElementById('analises')?.scrollIntoView({behavior:'smooth'});
      });
    }catch(error){if(same(ctx))host.textContent=error.message;}
  }
  window.MivDiagnosis={hydrate,queue,flush,solution,unlock,saleItem,saveReport,renderCentral,renderStatus,
    markAllowed:()=>snapshot?.key===context().key&&snapshot.mark_allowed===true,
    reset:()=>{snapshot=null;status('Entre na sua conta para salvar na Central.');},
    item:id=>String(id).startsWith('diagnosis:')?saleItem(id):null};
  publicRules();
})();
