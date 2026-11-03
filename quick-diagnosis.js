/* Short entry to the existing catalog; never contains paid solution content. */
(function(root,factory){const model=factory();if(typeof module==='object'&&module.exports)module.exports=model;else{root.MivQuickModel=model;boot();}
function boot(){
 const esc=markEsc;let modal=null,run=null,lastFocus=null;
 const identity=()=>[mivUser?.id||'visitor',mivActiveCompanyId||'business',state.profile.niche].join(':');
 function close(){modal?.close();modal?.remove();modal=null;lastFocus?.focus();}
 function valid(){if(run?.scope===identity())return true;close();toast('Seu perfil mudou. Inicie novamente para usar o contexto correto.');return false;}
 function start(){
  if(!MivNiche.require(start))return;
  close();lastFocus=document.activeElement;
  const points=EVOLUTION_DATA.flatMap(section=>section.cards.slice(0,2).map(card=>({section:section.title,id:card.qs[0].id,title:card.qs[0].assessment||card.qs[0][0]})));
  if(points.length!==8){toast('O catálogo está sendo atualizado. Tente novamente.');return;}
  run={scope:identity(),points,answers:[],index:0};modal=document.createElement('dialog');modal.className='quick-dialog';modal.setAttribute('aria-label','Diagnóstico rápido');document.body.append(modal);modal.addEventListener('cancel',event=>{event.preventDefault();close();});modal.showModal();draw();
  window.MivAnalytics?.track('analysis_start','quick');
 }
 function draw(){
  if(!valid())return;const index=run.index,point=run.points[index];
  modal.innerHTML=`<button type="button" class="quick-close" aria-label="Fechar diagnóstico">×</button><span class="eyebrow">DIAGNÓSTICO RÁPIDO · ${esc(state.profile.niche)}</span>${point?`<p>Pergunta ${index+1} de 8 · ${esc(point.section)}</p><progress max="8" value="${index}"></progress><h2 tabindex="-1">${esc(point.title)}</h2><p>Considere como sua empresa funciona hoje.</p><div class="quick-options">${[[2,'Sim'],[1,'Parcialmente'],[0,'Não'],[null,'Não sei avaliar']].map(([value,label])=>`<button type="button" class="outline" data-quick-answer="${value===null?'unknown':value}" aria-pressed="${run.answers.length>index&&run.answers[index]===value}">${label}</button>`).join('')}</div>${index?'<button type="button" class="quick-back">← Voltar</button>':''}`:result()}`;
  modal.querySelector('.quick-close').onclick=close;
  modal.querySelector('.quick-back')?.addEventListener('click',()=>{run.index--;draw();});
  modal.querySelectorAll('[data-quick-answer]').forEach(button=>button.onclick=()=>{if(!valid())return;run.answers[index]=button.dataset.quickAnswer==='unknown'?null:Number(button.dataset.quickAnswer);run.index++;draw();});
  modal.querySelector('[data-quick-complete]')?.addEventListener('click',()=>{if(!valid())return;close();MivEvolution.openComplete();});
  modal.querySelector('[data-quick-save]')?.addEventListener('click',()=>{
   if(!valid()||!mivUser)return;
   const changes=Object.fromEntries(run.points.map((p,i)=>[p.id,run.answers[i]]).filter(([,v])=>v!==null));
   if(!Object.keys(changes).length){toast('Nenhuma resposta pontuada para salvar.');return;}
   if(!confirm('Salvar estas respostas na sua análise completa? Respostas existentes nesses mesmos pontos serão substituídas; os demais pontos e suas anotações serão mantidos.'))return;
   if(MivEvolution.saveQuickAnswers(changes)){modal.querySelector('[data-quick-save]').textContent='Respostas salvas nesta análise';modal.querySelector('[data-quick-save]').disabled=true;}
  });
  modal.querySelector('h2')?.focus();modal.scrollTop=0;
 }
 function result(){
  if(!run.completed){run.completed=true;window.MivAnalytics?.track('analysis_complete','quick');}
  const summary=model.summarize(run.answers);const stages=[0,1,2,3].map(i=>{const s=model.summarize(run.answers.slice(i*2,i*2+2));return `<li><strong>${esc(run.points[i*2].section)}</strong><span>${s.score===null?'Sem pontuação':s.score+'%'} · ${s.known}/2 pontos avaliados</span></li>`;}).join('');
  const priorities=run.points.map((p,i)=>({...p,value:run.answers[i]})).filter(p=>p.value!==null&&p.value<2).sort((a,b)=>a.value-b.value).slice(0,3);
  return `<h2 tabindex="-1">Sua primeira leitura do negócio</h2><p>${summary.score===null?'Você ainda não tem pontos suficientes para calcular uma nota.':`Nos pontos que você avaliou: <strong>${summary.score}%</strong>.`} ${summary.unknown} resposta(s) “Não sei avaliar” ficaram fora da nota.</p><ul class="quick-stages">${stages}</ul><h3>Por onde começar</h3>${priorities.length?`<ol>${priorities.map(p=>`<li>${esc(p.title)}<br><small>Registre como você faz hoje, reúna um exemplo real e escolha uma melhoria para testar nesta semana.</small></li>`).join('')}</ol>`:'<p>Revise os pontos que você não soube avaliar ou aprofunde as áreas que já estão bem encaminhadas.</p>'}<p class="quick-note">Esta leitura cobre apenas 8 dos 60 pontos, com base nas suas respostas. Não substitui o diagnóstico completo. As soluções detalhadas seguem os limites do seu plano.</p><div class="quick-actions">${mivUser?'<button type="button" class="outline" data-quick-save>Salvar respostas na minha análise</button>':'<p>Esta leitura não foi salva em uma conta. Crie sua conta ao aprofundar o diagnóstico para guardar suas próximas análises.</p>'}<button type="button" class="primary" data-quick-complete>Aprofundar nas quatro etapas</button></div>`;
 }
 document.getElementById('focusNiche').onclick=start;document.querySelectorAll('[data-quick-start]').forEach(button=>button.onclick=start);
 window.MivQuick={start,close};
}
})(typeof globalThis!=='undefined'?globalThis:this,()=>({summarize(values){const known=values.filter(v=>[0,1,2].includes(v));return {known:known.length,unknown:values.length-known.length,score:known.length?Math.round(known.reduce((a,b)=>a+b,0)/(known.length*2)*100):null};}}));

if(typeof window!=='undefined')window.addEventListener('scroll',()=>document.querySelector('.floating-header')?.classList.toggle('launch-scrolled',scrollY>100),{passive:true});

if(typeof window!=='undefined')document.querySelectorAll('[data-miv-topic]').forEach(button=>button.addEventListener('click',()=>{const input=document.getElementById('evQuestionSearch');if(!input)return;input.value=({'Vendas':'vendas atendimento','Marca':'marca posicionamento','Gestão':'custos processos'})[button.dataset.mivTopic]||button.dataset.mivTopic;input.dispatchEvent(new Event('input',{bubbles:true}));input.scrollIntoView({behavior:'smooth',block:'center'});input.focus({preventScroll:true});document.querySelectorAll('[data-miv-topic]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
