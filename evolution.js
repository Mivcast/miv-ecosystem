/* Evaluation data is separate from rendering and the existing paid analyses. */
(() => {
  const esc = markEsc;
  const revealed = new Set();
  let reportMode = 'summary';
  let previousFocus = null;
  let currentDialog = null;
  const labels = {2:'Ok',1:'Mediano',0:'Ruim',na:'Não se aplica'};
  const classes = {2:'yes',1:'maybe',0:'no',na:'na'};
  const scope = () => ['mivEvolution:v2', typeof mivUser !== 'undefined' ? mivUser?.id || 'visitor' : 'visitor', typeof mivActiveCompanyId !== 'undefined' ? mivActiveCompanyId || 'business' : 'business', state.profile.niche].join(':');
  function read() {
    try {
      const raw=localStorage.getItem(scope());
      if(raw){const data=JSON.parse(raw);return data&&typeof data==='object'&&!Array.isArray(data)?data:{}}
      const oldKey=scope().replace('mivEvolution:v2:','mivEvolution:v1:'),old=JSON.parse(localStorage.getItem(oldKey)||'{}'),data={_schema:2,_legacyKey:oldKey};
      EVOLUTION_DATA.forEach(section=>section.cards.forEach(card=>card.qs.forEach(q=>{
        const prior=q.legacyKey?old?.[q.legacyKey]:null;
        if(prior&&typeof prior==='object')data[q.id]={...prior,answer:q.legacyInvert&&[0,2].includes(prior.answer)?2-prior.answer:prior.answer};
      })));
      Object.entries(old||{}).filter(([key])=>key.startsWith('favorite:')).forEach(([key,value])=>data[key]=value);
      write(data);return data;
    }catch{return {}}
  }
  function write(data) {
    try { localStorage.setItem(scope(), JSON.stringify(data)); window.MivDiagnosis?.queue(data); return true; }
    catch { toast('Não foi possível salvar neste navegador. Verifique o espaço disponível.'); return false; }
  }
  const valuesFor = q => q.allowNA ? [2,1,0,'na'] : [2,1,0];
  const answer = (data,id) => [0,1,2].includes(data[id]?.answer) ? data[id].answer : data[id]?.answer==='na'&&String(data[id]?.naReason||'').trim()&&EVOLUTION_DATA.some(s=>s.cards.some(c=>c.qs.some(q=>q.id===id&&q.allowNA)))?'na':null;
  function rows(data = read(),sections=EVOLUTION_DATA) {
    return sections.flatMap(section => section.cards.flatMap(card => card.qs.map((q,index) => {
      const id = q.id;
      return {section,card,q,index,id,value:answer(data,id),note:String(data[id]?.note || ''),naReason:String(data[id]?.naReason||'')};
    })));
  }
  function stats(list) {
    const answered = list.filter(row => row.value !== null),applicable=answered.filter(row=>row.value!=='na');
    return {count:answered.length,total:list.length,progress:Math.round(answered.length/list.length*100),score:applicable.length ? Math.round(applicable.reduce((sum,row)=>sum+row.value,0)/(applicable.length*2)*100) : null};
  }
  function status(value) { return value === null ? 'Sem pontuação' : value >= 80 ? 'Bem encaminhado' : value >= 55 ? 'Pode melhorar' : 'Precisa de atenção'; }
  function solutions(row,meta=null) { return (meta?meta.solutions?.[row.id]:window.MivDiagnosis?.solution(row.id))?.steps||[]; }
  function openNotApplicable(id,onSaved) {
    const row=rows().find(row=>row.id===id);if(!row?.q.allowNA)return;
    const element=dialog('Não se aplica',`<p>${esc(row.q[0])}</p><label for="evNaReason">Por que este ponto não se aplica ao seu negócio?</label><textarea id="evNaReason" rows="4" maxlength="1000">${esc(row.naReason)}</textarea><p data-ev-na-error role="alert"></p><button type="button" class="primary" data-ev-na-save>Salvar justificativa</button>`);
    element.returnTo=onSaved;
    element.querySelector('[data-ev-na-save]').onclick=()=>{
      const reason=element.querySelector('#evNaReason').value.trim();
      if(!reason){element.querySelector('[data-ev-na-error]').textContent='Explique o motivo para excluir este ponto da pontuação.';return}
      const data=read();data[id]={...data[id],answer:'na',naReason:reason};
      if(write(data)){closeDialog(false);render();onSaved?.()}
    };
  }
  function openLegacy() {
    let old={};try{old=JSON.parse(localStorage.getItem(scope().replace('mivEvolution:v2:','mivEvolution:v1:'))||'{}')}catch{}
    const saved=DIAGNOSIS_LEGACY.filter(row=>old[row.key]&&typeof old[row.key]==='object');
    dialog('Avaliação anterior',`<p>Respostas originais preservadas antes da reformulação. Perguntas com outro significado não receberam essas respostas automaticamente.</p>${saved.length?saved.map(row=>`<div class="ev-callout"><b>${esc(row.card)} · ${esc(row.text)}</b><p>${labels[old[row.key].answer]||'Não respondido'}</p><p>${esc(old[row.key].note||'')}</p></div>`).join(''):'<p>Nenhuma avaliação anterior foi encontrada neste navegador para este perfil e nicho.</p>'}`,true);
  }
  const list = items => `<ul>${items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`;
  // This is a reading indicator only. Access continues to be checked by the server.
  const viewedKey = () => scope()+':viewed';
  function viewedPoints() { try { return JSON.parse(localStorage.getItem(viewedKey())||'{}')||{}; } catch { return {}; } }
  function pointActions(row) {
    const viewed=!!viewedPoints()[row.id];
    return `<div class="ev-question-actions"><button type="button" title="Por que isso importa?" aria-label="Por que isso importa: ${esc(row.q[0])}" data-ev-info="${row.id}">i</button><button type="button" class="${viewed?'ev-solution-viewed':''}" data-ev-solve="${row.id}">${viewed?'Solução consultada':'Descobrir a solução'}</button></div>`;
  }
  function markViewed(id) {
    const row=rows().find(row=>row.id===id);if(row)window.MivAnalytics?.track('solution_view','diagnosis:'+row.card.id);
    try { localStorage.setItem(viewedKey(),JSON.stringify({...viewedPoints(),[id]:true})); } catch { /* Reading remains possible without local storage. */ }
    document.querySelectorAll(`[data-ev-solve="${id}"]`).forEach(button=>{button.classList.add('ev-solution-viewed');button.textContent='Solução consultada';});
  }
  function render() {
    const host = document.getElementById('analysisGrid'); if (!host) return;
    const all = rows(), overall = stats(all);
    host.innerHTML = `<div class="ev-map-summary"><div class="ev-summary-title"><span class="eyebrow">MAPA DE EVOLUÇÃO EMPRESARIAL EM ETAPAS</span><h3>Veja o que já funciona, o que pode melhorar e o que precisa começar.</h3></div><div class="ev-summary-stats">${[['Pontos respondidos',overall.count],['Ok',all.filter(row=>row.value===2).length],['Mediano',all.filter(row=>row.value===1).length],['Ruim',all.filter(row=>row.value===0).length]].map(([label,value])=>`<div><b>${value}</b><span>${label}</span></div>`).join('')}</div><div class="ev-progress"><label for="evProgress">Progresso geral <b>${overall.progress}%</b></label><progress id="evProgress" max="100" value="${overall.progress}"></progress><small>${overall.count} de ${overall.total} pontos respondidos</small></div><div class="ev-toolbar-actions"><button class="outline" data-ev-report>Meu relatório</button><button class="primary" data-ev-print>Imprimir</button></div></div>
      ${EVOLUTION_DATA.map(section => {
        const sectionRows = all.filter(row=>row.section.id===section.id), summary = stats(sectionRows);
        return `<section class="ev-stage"><div class="ev-stage-head"><div><span class="eyebrow">${esc(section.kicker)}</span><h3>${esc(section.title)}</h3><p>${esc(section.desc)}</p></div><div class="ev-stage-score"><b>${summary.score===null?'—':summary.score+'%'}</b><span>autoavaliação declarada</span></div></div><div class="ev-cards">${section.cards.map(card=>{
          const cardRows=sectionRows.filter(row=>row.card.id===card.id), score=stats(cardRows);
          const image=card.img;
          return `<article class="ev-card"><div class="ev-visual"><img src="${esc(image)}" alt="" loading="lazy"><span>${status(score.score)}${score.score===null?'':' · '+score.score+'%'}</span></div><div class="ev-card-content"><small>${esc(section.title)}</small><h4>${esc(card.title)}</h4><p>${esc(card.desc)}</p><div class="ev-impact">${card.impact.map(value=>`<span>Impacta: ${esc(value)}</span>`).join('')}</div>${cardRows.map(row=>`<div class="ev-question" data-ev-row="${row.id}"><div class="ev-question-heading"><span class="ev-q-status ${classes[row.value]||'none'}" aria-hidden="true">${row.value===2?'✓':row.value===1?'?':row.value===0?'×':row.value==='na'?'—':'•'}</span><p>${esc(row.q[0])}</p></div><div class="ev-choices" role="group" aria-label="${esc(row.q[0])}">${valuesFor(row.q).map(value=>`<button type="button" class="${classes[value]}" aria-pressed="${row.value===value}" data-ev-answer="${row.id}" data-value="${value}">${labels[value]}</button>`).join('')}</div>${pointActions(row)}</div>`).join('')}<div class="ev-card-footer"><small>${score.count}/${score.total} respondidos</small><progress max="3" value="${score.count}" aria-label="Progresso de ${esc(card.title)}"></progress></div></div></article>`;
        }).join('')}</div></section>`;
      }).join('')}`;
    host.querySelectorAll('[data-ev-answer]').forEach(button=>button.onclick=()=>{
      const id=button.dataset.evAnswer;if(button.dataset.value==='na'){openNotApplicable(id);return}const data=read();data[id]={...data[id],answer:Number(button.dataset.value)};
      if(write(data)) { render(); document.querySelector(`[data-ev-answer="${id}"][data-value="${button.dataset.value}"]`)?.focus({preventScroll:true}); }
    });
    host.querySelectorAll('[data-ev-info]').forEach(button=>button.onclick=()=>openPoint(button.dataset.evInfo,false));
    host.querySelectorAll('[data-ev-solve]').forEach(button=>button.onclick=()=>openPoint(button.dataset.evSolve,true));
    host.querySelector('[data-ev-report]').onclick=()=>openReport();
    host.querySelector('[data-ev-print]').onclick=()=>{openReport();window.print()};
    const note=document.createElement('p');note.className='ev-assessment-note';
    note.textContent='Ok = 2 pontos; mediano = 1; ruim = 0. A porcentagem considera apenas os itens respondidos e aplicáveis. Autoavaliação orientativa, não uma auditoria ou certificação. Perguntas reformuladas: revise suas respostas anteriores. ';
    const archive=document.createElement('button');archive.type='button';archive.textContent='Ver avaliação anterior';archive.onclick=openLegacy;note.append(archive);
    host.querySelector('.ev-map-summary').after(note);
    const health=document.createElement('p');health.className='ev-overall-health';health.textContent=`Resultado geral: ${overall.score===null?'aguardando respostas':overall.score+'% · '+status(overall.score)} · ${overall.count}/${overall.total} pontos avaliados`;host.querySelector('.ev-progress').after(health);
    const sync=document.createElement('p');sync.id='evCloudStatus';sync.className='ev-assessment-note';note.after(sync);
    host.querySelectorAll('[data-ev-row]').forEach(el=>compactQuestion(el,all.find(r=>r.id===el.dataset.evRow)));
    host.querySelectorAll('.ev-stage').forEach((el,i)=>{if(!EVOLUTION_DATA[i].intro)return;const details=document.createElement('details');details.className='ev-stage-intro';const summary=document.createElement('summary');summary.textContent='Sobre esta etapa';const text=document.createElement('p');text.textContent=EVOLUTION_DATA[i].intro;details.append(summary,text);el.querySelector('.ev-stage-head').after(details);});
    window.MivQuestionFinder?.mount(host,all,id=>openPoint(id,false));
    window.MivDiagnosis?.renderStatus();window.MivDiagnosis?.hydrate().catch(()=>{});
  }
  function compactQuestion(element,row) {
    const choices=element.querySelector('.ev-choices');if(!choices||!row)return;
    const prompt=document.createElement('span');prompt.className='ev-choice-prompt';prompt.textContent='Como seu negócio está nesse ponto?';choices.prepend(prompt);
    if(row.q.summary){const summary=document.createElement('p');summary.className='ev-q-summary';summary.textContent=row.q.summary;choices.after(summary);}
  }
  function dialog(title,body,wide=false) {
    closeDialog(false); previousFocus=document.activeElement;
    const element=document.createElement('dialog');element.className='ev-dialog'+(wide?' ev-report':'');
    element.innerHTML=`<div class="ev-dialog-head"><h2>${esc(title)}</h2><button type="button" aria-label="Fechar" data-ev-close>×</button></div><div class="ev-dialog-body">${body}</div>`;
    document.body.append(element);currentDialog=element;
    element.querySelector('[data-ev-close]').onclick=closeDialog;
    element.addEventListener('cancel',event=>{event.preventDefault();closeDialog()});
    element.addEventListener('click',event=>{if(event.target===element) {const r=element.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog()}});
    element.showModal();return element;
  }
  function closeDialog(resume=true) { if(currentDialog){const back=currentDialog.returnTo;currentDialog.close();currentDialog.remove();currentDialog=null;previousFocus?.focus({preventScroll:true});if(resume)back?.()} }
  function addReturn(element,returnTo) {
    element.returnTo=returnTo;if(!returnTo)return;
    const button=document.createElement('button');button.type='button';button.className='outline';
    button.textContent='Voltar à análise completa';button.onclick=()=>closeDialog();
    element.querySelector('.ev-dialog-body').append(button);
  }
  async function openPoint(id,solve,returnTo=null) {
    const row=rows().find(row=>row.id===id);if(!row)return;
    const initialScope=scope();
    let detail=null;
    if(solve){
      if(!mivUser){closeDialog(false);pendingAuthAction={type:'diagnosis',pointId:id};openAuth('login');return}
      try{
        const grant=await MivDiagnosis.unlock(id);
        if(scope()!==initialScope)return;
        if(!grant.allowed){
          const item=MivDiagnosis.saleItem(row.card.id);
          const gate=dialog('Seu próximo passo começa aqui',`<div class="ev-unlock-intro"><span class="eyebrow">${esc(row.card.title)}</span><h3>Da dúvida a uma ação concreta.</h3><p>${esc(row.q[0])}</p></div><ul class="ev-unlock-benefits"><li>Entenda o que fazer e por onde começar.</li><li>Veja passos práticos e um exemplo para se orientar.</li><li>Registre sua análise na Central e retome quando precisar.</li></ul><div class="ev-unlock-options">${grant.free_remaining>0?`<div class="ev-unlock-option ev-free-option"><strong>Comece com sua cortesia</strong><p>${grant.free_remaining} ${grant.free_remaining===1?'solução gratuita disponível':'soluções gratuitas disponíveis'} nesta conta. Ao continuar, você usa uma delas. A cortesia é única por conta e não renova mensalmente.</p><button type="button" class="primary" data-ev-free>Usar uma solução grátis</button></div>`:'<p class="ev-free-used">Você já utilizou as soluções gratuitas desta conta. Escolha como continuar:</p>'}<div class="ev-unlock-option"><strong>Prefere resolver este card?</strong><p>Compra avulsa das três soluções de ${esc(row.card.title)}, sem assinatura.</p><button type="button" class="outline" data-ev-buy>Comprar as três soluções por ${esc(item.price)}</button></div><div class="ev-unlock-option"><strong>Quer explorar todas as etapas?</strong><p>Acesse soluções de todas as quatro etapas. Compare também o apoio do MARK e os limites de cada plano.</p><button type="button" class="outline" data-ev-plans>Comparar Pro e Premium</button></div></div><p role="alert" data-ev-access-error></p>`);
          addReturn(gate,returnTo);
          gate.querySelector('[data-ev-free]')?.addEventListener('click',async event=>{
            event.currentTarget.disabled=true;
            try{const result=await MivDiagnosis.unlock(id,true);if(scope()!==initialScope)return;if(!result.allowed)throw new Error('A cortesia já foi utilizada em outra solicitação.');await openPoint(id,true,returnTo)}
            catch(error){if(gate.isConnected){gate.querySelector('[data-ev-access-error]').textContent=error.message;event.target.disabled=false}}
          });
          gate.querySelector('[data-ev-buy]').onclick=()=>{closeDialog(false);openPaywall(item)};
          gate.querySelector('[data-ev-plans]').onclick=()=>{closeDialog(false);route('home');document.getElementById('planos')?.scrollIntoView({behavior:'smooth'})};
          return;
        }
        detail=grant.solution;
      }catch(error){toast(error.message);return}
    }
    const resources=(row.q.resources||[]).map(id=>getItem(id)).filter(Boolean);
    const element=dialog(row.q[0],`<span class="eyebrow">${esc(row.section.title)} · ${esc(row.card.title)}</span><div class="ev-callout"><b>${solve?'O jeito certo':'Por que isso importa?'}</b><p>${esc(solve?detail.standard:row.q[2])}</p></div>${solve?`<h3>Como colocar em prática</h3>${list(detail.steps)}<h3>Exemplo prático</h3><p class="ev-practical-example">${esc(detail.example)}</p><p class="ev-answer-label">Sua avaliação: <b>${labels[row.value]||'Não respondido'}</b></p>${row.value==='na'?`<p><b>Justificativa:</b> ${esc(row.naReason)}</p>`:''}<label for="evNote">O que acontece hoje na sua empresa?</label><textarea id="evNote" rows="5" maxlength="5000" placeholder="Descreva sua rotina e dificuldades.">${esc(row.note)}</textarea><button type="button" class="primary" data-ev-save>Salvar análise na Central</button><p role="status" data-ev-save-status></p>`:'<button type="button" class="primary" data-ev-deepen>Descobrir a solução</button>'}${solve&&MivDiagnosis.markAllowed()?'<button type="button" class="outline" data-ev-mark>Perguntar ao MARK.IA sobre este ponto</button>':''}${solve&&resources.length?`<h3>Para aprofundar na biblioteca</h3><div class="ev-resource-links">${resources.map(item=>`<button type="button" class="outline" data-ev-resource="${esc(item.id)}">${esc(item.title)}</button>`).join('')}</div>`:''}`);
    addReturn(element,returnTo);
    if(solve)markViewed(id);
    const saveDraft=()=>{if(scope()!==initialScope){toast('Seu perfil mudou. Abra a análise novamente.');return false}const textarea=element.querySelector('#evNote');if(!textarea)return true;const data=read();data[id]={...data[id],note:textarea.value};return write(data)};
    element.querySelectorAll('[data-ev-resource]').forEach(button=>button.onclick=()=>{if(!saveDraft())return;closeDialog(false);openItem(button.dataset.evResource)});
    element.querySelector('[data-ev-save]')?.addEventListener('click',async event=>{
      if(!saveDraft())return;event.currentTarget.disabled=true;
      try{await MivDiagnosis.flush();toast('Sua análise foi salva na Central.');closeDialog()}
      catch(error){if(element.isConnected){element.querySelector('[data-ev-save-status]').textContent=error.message;event.target.disabled=false}}
    });
    element.querySelector('[data-ev-deepen]')?.addEventListener('click',()=>openPoint(id,true,returnTo));
    element.querySelector('[data-ev-mark]')?.addEventListener('click',()=>{
      const draft=element.querySelector('#evNote')?.value??row.note;if(!saveDraft())return;
      closeDialog(false);state.current={id:'diagnosis:'+row.card.id,title:row.card.title,diagnosis_point_id:id};
      document.getElementById('markFab')?.click();
      const input=document.getElementById('markInput');
      input.value=`Meu nicho é ${state.profile.niche}. Estou avaliando ${row.section.title} / ${row.card.title}. Pergunta: ${row.q[0]} Minha resposta: ${labels[row.value]||'Não respondido'}. O que acontece hoje: ${draft||'Sem observações'}. Informações da empresa: ${companyContextText()}. Orientação: ${detail.standard}. Como colocar em prática: ${detail.steps.join(' ')} Exemplo: ${detail.example}. Ajude-me a adaptar para o meu negócio.`;
      input.focus();
    });
  }
  function openComplete(initialStep=0,scroll=0) {
    if(!mivUser){pendingAuthAction={type:'diagnosisComplete',step:initialStep};openAuth('login');return}
    let step=Math.max(0,Math.min(3,Number(initialStep)||0));
    const element=dialog('Análise empresarial completa','<div class="ev-wizard-content"></div>',true);
    const drawBody=()=>{
      const all=rows(),section=EVOLUTION_DATA[step],group=all.filter(row=>row.section.id===section.id),total=stats(all);
      element.querySelector('.ev-wizard-content').innerHTML=`<div class="ev-wizard-progress"><b>${esc(state.profile.niche)}</b><span>${total.count} de ${total.total} pontos respondidos · ${total.progress}%</span><progress max="60" value="${total.count}" aria-label="Progresso da análise completa"></progress></div><div class="ev-wizard-tabs" role="group" aria-label="Etapas da análise">${EVOLUTION_DATA.map((item,index)=>`<button type="button" data-ev-step="${index}" aria-pressed="${index===step}">${index+1}. ${esc(item.title)}</button>`).join('')}</div><h3>${esc(section.title)}</h3>${section.cards.map(card=>`<fieldset class="ev-wizard-card"><legend>${esc(card.title)}</legend>${group.filter(row=>row.card.id===card.id).map(row=>`<div class="ev-wizard-question"><p>${esc(row.q[0])}</p><div class="ev-choices" role="group" aria-label="${esc(row.q[0])}">${valuesFor(row.q).map(value=>`<button type="button" class="${classes[value]}" data-ev-wizard-answer="${row.id}" data-value="${value}" aria-pressed="${row.value===value}">${labels[value]}</button>`).join('')}</div>${pointActions(row)}</div>`).join('')}</fieldset>`).join('')}<div class="ev-wizard-footer"><button type="button" class="outline" data-ev-step="${step-1}" ${step===0?'disabled':''}>Etapa anterior</button>${step<3?`<button type="button" class="primary" data-ev-step="${step+1}">Próxima etapa</button>`:`<button type="button" class="primary" data-ev-finish ${total.count<total.total?'disabled':''}>Gerar relatório completo</button>`}</div><p class="ev-wizard-status" role="status">${total.count<total.total?`Faltam ${total.total-total.count} respostas para concluir a análise. Suas respostas são sincronizadas com sua Central.`:'Tudo respondido. O relatório reúne suas respostas e as soluções liberadas para sua conta.'}</p>`;
    };
    const draw=()=>{drawBody();element.querySelectorAll('.ev-wizard-question').forEach(el=>{const button=el.querySelector('[data-ev-wizard-answer]');compactQuestion(el,rows().find(r=>r.id===button?.dataset.evWizardAnswer));});};
    element.addEventListener('click',event=>{
      const button=event.target.closest('button');if(!button||button.disabled)return;
      if(button.hasAttribute('data-ev-solve')||button.hasAttribute('data-ev-info')){
        const savedScroll=element.scrollTop;
        openPoint(button.dataset.evSolve||button.dataset.evInfo,button.hasAttribute('data-ev-solve'),()=>openComplete(step,savedScroll));return;
      }
      if(button.hasAttribute('data-ev-wizard-answer')){
        const id=button.dataset.evWizardAnswer;if(button.dataset.value==='na'){openNotApplicable(id,()=>openComplete(step));return}const value=Number(button.dataset.value),data=read();
        data[id]={...data[id],answer:value};
        if(write(data)){render();draw();element.querySelector(`[data-ev-wizard-answer="${id}"][data-value="${value}"]`)?.focus({preventScroll:true})}
      }else if(button.hasAttribute('data-ev-step')){
        step=Number(button.dataset.evStep);draw();element.scrollTop=0;
      }else if(button.hasAttribute('data-ev-finish')){
        if(stats(rows()).count!==60)return;
        reportMode='detailed';openReport();
      }
    });
    draw();
    element.scrollTop=scroll;
  }
  function reportHTML(data=read(),meta=null) {
    const sections=meta?(meta.catalog?MivCatalog.toEvolution(meta.catalog):MivCatalog.previousSections):EVOLUTION_DATA;
    const all=rows(data,sections),overall=stats(all),niche=meta?.niche||state.profile.niche;
    return `<div class="ev-report-heading"><span>MIV ECOSYSTEM · ${esc(new Date().toLocaleDateString('pt-BR'))}</span><h1>Relatório de Evolução Empresarial</h1><p>${esc(niche)}</p></div><div class="ev-report-overview"><div><b>${overall.progress}%</b><span>avaliação preenchida</span></div><div><b>${overall.score===null?'—':overall.score+'%'}</b><span>situação declarada dos pontos aplicáveis</span></div><div><b>${all.filter(row=>row.value===0).length}</b><span>práticas ainda não adotadas</span></div><div><b>${all.filter(row=>row.value===1).length}</b><span>práticas que podem melhorar</span></div></div><p>Autoavaliação orientativa, sem certificação ou auditoria comprovada: ${overall.count} de ${overall.total} pontos respondidos. Pontos sem resposta permanecem pendentes.</p>${sections.map(section=>`<section class="ev-report-stage"><h2>${esc(section.kicker)} · ${esc(section.title)}</h2><p>${stats(all.filter(r=>r.section.id===section.id)).score??"—"}% · autoavaliação da etapa</p>${section.cards.map(card=>`<div class="ev-report-card"><h3>${esc(card.title)}</h3><p>${stats(all.filter(r=>r.card.id===card.id)).score??"—"}% · autoavaliação do card</p>${all.filter(row=>row.card.id===card.id).map(row=>{
      const detail=meta?meta.solutions?.[row.id]:window.MivDiagnosis?.solution(row.id);
      return `<div class="ev-report-question"><div><b>${esc(row.q[0])}</b><span class="ev-report-status ${classes[row.value]||''}">${labels[row.value]||'Não respondido'}</span></div>${reportMode==='detailed'?(detail?`<h4>Orientação e próximos passos</h4>${list(detail.steps)}<p><b>Exemplo prático:</b> ${esc(detail.example)}</p><p><b>Por que importa:</b> ${esc(row.q[2])}</p>`:'<p>Solução não liberada neste relatório. Você pode desbloqueá-la no card correspondente.</p>'):''}${row.value==='na'?`<p class="ev-report-note"><b>Justificativa de não aplicação:</b> ${esc(row.naReason)}</p>`:''}${row.note?`<p class="ev-report-note"><b>Análise registrada:</b> ${esc(row.note)}</p>`:''}</div>`;
    }).join('')}</div>`).join('')}</section>`).join('')}`;
  }
  function openReport(meta=null) {
    const content=()=>reportHTML(meta?.data||read(),meta);
    const element=dialog('Meu relatório',`<div class="ev-report-tools"><div role="group" aria-label="Formato do relatório"><button data-ev-mode="summary">Resumo</button><button data-ev-mode="detailed">Detalhado + soluções</button></div>${!meta?'<button type="button" class="outline" data-ev-save-report>Salvar na Central</button>':''}<button type="button" class="primary" data-ev-print-report>Imprimir / Salvar em PDF</button></div><p role="status" data-ev-report-status></p><div id="evReportContent">${content()}</div>`,true);
    const update=()=>{element.querySelectorAll('[data-ev-mode]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.evMode===reportMode));element.querySelector('#evReportContent').innerHTML=content()};
    element.querySelectorAll('[data-ev-mode]').forEach(button=>button.onclick=()=>{reportMode=button.dataset.evMode;update()});
    element.querySelector('[data-ev-save-report]')?.addEventListener('click',async event=>{
      if(!mivUser){closeDialog();openAuth('login');return}
      event.currentTarget.disabled=true;
      try{await MivDiagnosis.saveReport();element.querySelector('[data-ev-report-status]').textContent='Relatório salvo na Central.'}
      catch(error){element.querySelector('[data-ev-report-status]').textContent=error.message;event.target.disabled=false}
    });
    element.querySelector('[data-ev-print-report]').onclick=()=>window.print();update();
    if(!meta&&mivUser){const print=element.querySelector('[data-ev-print-report]');print.disabled=true;MivDiagnosis.hydrate(true).then(()=>{if(element.isConnected)update()}).catch(error=>{if(element.isConnected)element.querySelector('[data-ev-report-status]').textContent=error.message}).finally(()=>print.disabled=false)}
  }
  function renderNichePicker() {
    document.getElementById('nicheList').innerHTML=Object.keys(niches).sort((a,b)=>a.localeCompare(b,'pt-BR')).map(n=>`<option value="${esc(n)}"></option>`).join('');
    const host=document.getElementById('nicheGroups');
    host.innerHTML=`<div class="ev-niche-list">${groups.map((group,index)=>`<button type="button" data-ev-group="${index}"><img src="${esc(nicheThumb(group.name))}" alt="" loading="lazy"><span>${esc(group.name)}</span></button>`).join('')}</div>`;
    host.querySelectorAll('[data-ev-group]').forEach(button=>button.onclick=()=>{
      const group=groups[Number(button.dataset.evGroup)];
      const element=dialog('Escolha sua atividade',`<p>${esc(group.name)}</p><div class="ev-niche-options">${[group.name,...group.subs].map(name=>`<button type="button" class="outline" data-ev-niche="${esc(name)}">${esc(name===group.name?'Visão geral de '+name:name)}</button>`).join('')}</div>`);
      element.querySelectorAll('[data-ev-niche]').forEach(option=>option.onclick=()=>{document.getElementById('nicheSearch').value=option.dataset.evNiche;closeDialog();applyTheme(option.dataset.evNiche,group.theme,false);render()});
    });
  }
  function marketCard(item) {
    const channel=item.channel||item.title,visible=revealed.has(assetSlug(channel)),saved=state.favorites.includes(item.id);
    return `<article class="market-card competitor-channel-card channel-${assetSlug(channel)} ev-movement ${visible?'ev-revealed':''}"><div class="market-card-top"><span class="market-stars">${marketStars(item.importance)}</span><button class="heart ${saved?'saved':''}" aria-label="Salvar ${esc(channel)}" data-fav="${esc(item.id)}">${saved?'♥':'♡'}</button></div><div class="market-card-body"><span class="meta-pill">MOVIMENTO</span><h3>${esc(channel)}</h3>${visible?`<div class="ev-movement-result"><p>${competitorDescriptionHtml(item.desc,item)}</p><strong>Nossa sugestão para você</strong><p>${esc(item.mark_strategy)}</p></div>`:''}</div><div class="market-card-actions"><button class="primary market-card-action compact" data-competitor-channel="${esc(channel)}">Atualizar movimentos 30 dias</button>${visible&&hasPremiumAccess()?`<button class="outline" data-market-mark="${esc(channel)}">Conversar com MARK</button>`:''}</div>${visible&&item.source_url?`<a class="source-link" href="${esc(item.source_url)}" target="_blank" rel="noopener">Fonte: ${esc(item.source||'Pesquisa do mercado')}</a>`:''}</article>`;
  }
  window.MivEvolution={render,renderNichePicker,marketCard,openComplete,localData:read,close:closeDialog,
    restoreCloud:data=>{localStorage.setItem(scope(),JSON.stringify(data));render()},
    openSolution:id=>openPoint(id,true),openSavedReport:meta=>openReport(meta),
    openCard:id=>{const row=rows().find(row=>row.card.id===id);if(row)openPoint(row.id,true)},
    reveal:channel=>revealed.add(assetSlug(channel)),resetMovements:()=>revealed.clear()};
})();
