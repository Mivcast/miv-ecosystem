(() => {
 let query='';
 const normalize=value=>String(value||'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
 const stop=new Set(['como','para','meu','minha','quero','preciso','ajuda','com','uma','uns','das','dos','que','por','mais','tenho','fazer','empresa','negocio']);
 function rank(rows,text){
  let tokens=normalize(text).split(/[^a-z0-9]+/).filter(t=>t.length>2&&!stop.has(t));
  if(tokens.some(t=>['instagram','tiktok','facebook','posts','postar'].includes(t)))tokens.push('redes','conteudo');
  if(tokens.includes('whats'))tokens.push('whatsapp');if(tokens.includes('precos'))tokens.push('preco');
  tokens=[...new Set(tokens)].slice(0,15);if(!tokens.length)return [];
  return rows.map(row=>{const title=normalize(row.q[0]),words=normalize(row.q.keywords+' '+row.q.summary+' '+row.card.title);return {row,score:tokens.reduce((sum,t)=>sum+(title.includes(t)?3:words.includes(t)?1:0),0)};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 }
 function mount(host,rows,open){
  const esc=markEsc,section=document.createElement('section');section.className='ev-finder';
  section.innerHTML='<h3>Qual assunto você quer resolver?</h3><label for="evQuestionSearch">Buscar nas quatro etapas</label><input id="evQuestionSearch" type="search" maxlength="180" placeholder="Ex.: redes sociais, preço, WhatsApp"><p class="ev-finder-status" role="status"></p><div class="ev-finder-results"></div>';
  host.append(section);const input=section.querySelector('input'),results=section.querySelector('.ev-finder-results');input.value=query;
  function draw(){
   const matches=rank(rows,query),ids=new Set(matches.map(x=>x.row.id));
   host.querySelectorAll('[data-ev-row]').forEach(el=>el.classList.toggle('ev-search-match',ids.has(el.dataset.evRow)));
   section.querySelector('[role=status]').textContent=query.trim()?(matches.length?matches.length+' perguntas relacionadas.':'Nenhuma pergunta encontrada. Tente um termo como vendas, custos ou atendimento.') :'';
   results.innerHTML=matches.slice(0,6).map(({row})=>`<button type="button" class="outline" data-find-point="${row.id}"><small>${esc(row.section.title)} · ${esc(row.card.title)}</small><strong>${esc(row.q[0])}</strong></button>`).join('');
   results.querySelectorAll('button').forEach(button=>button.onclick=()=>{
    const id=button.dataset.findPoint,row=host.querySelector(`[data-ev-row="${id}"]`);row?.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});row?.querySelector('[data-ev-solve]')?.focus({preventScroll:true});open(id);
   });
  }
  input.oninput=()=>{query=input.value;draw();};draw();
 }
 window.MivQuestionFinder={mount,rank};
})();
