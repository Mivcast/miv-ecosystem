(() => {
  const el=id=>document.getElementById(id);
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number=value=>new Intl.NumberFormat('pt-BR').format(Number(value)||0);
  const money=value=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format((Number(value)||0)/100);
  const percent=(a,b)=>b?(a/b*100).toFixed(1).replace('.',',')+'%':'—';
  const date=value=>new Date(value).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'});
  const labels={page_view:'Páginas vistas',card_view:'Exposições de cards',card_click:'Cliques em cards',card_open:'Conteúdos abertos',favorite_add:'Favoritos adicionados',analysis_start:'Análises completas iniciadas',solution_view:'Soluções consultadas',report_created:'Relatórios salvos',tool_open:'Ferramentas abertas',market_search:'Pesquisas de mercado iniciadas',mark_open:'Aberturas do MARK',mobile:'Celular',tablet:'Tablet',desktop:'Desktop',unknown:'Não identificado',direct:'Direto / sem referência',free:'Grátis',pro:'Pro',premium:'Premium'};
  const localDay=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  let data=null,revision=0,applied=null;
  function title(id){
    if(id==='complete')return 'Análise empresarial completa';
    if(id.startsWith('plan:'))return 'Plano '+(labels[id.slice(5)]||id.slice(5));
    if(id.startsWith('diagnosis:'))return 'Análise · '+(EVOLUTION_DATA.flatMap(s=>s.cards).find(c=>c.id===id.slice(10))?.title||id.slice(10));
    if(id.startsWith('point:'))return 'Solução · '+id.slice(6).split('.').join(' / ');
    if(id.startsWith('channel:'))return 'Mercado · '+id.slice(8);
    return catalogCards.find(c=>c.item_id===id)?.title||id;
  }
  const nav=document.createElement('button');nav.dataset.v='analytics';nav.title='Resultados & Comportamento';nav.setAttribute('aria-label','Resultados & Comportamento');nav.innerHTML='▥ <span>Resultados & Comportamento</span>';
  document.querySelector('.side [data-v="users"]').before(nav);
  const section=document.createElement('section');section.className='view';section.id='v-analytics';
  section.innerHTML=`<div class="analytics-head"><div><h2>Resultados & Comportamento</h2><p>Vendas confirmadas, jornada de compra e uso do ecossistema.</p></div><div class="analytics-head-actions"><button type="button" class="secondary" id="analyticsExport" disabled>Exportar CSV</button></div></div>
   <form class="analytics-filters" id="analyticsFilters">
    <label class="analytics-period">Período<select id="analyticsPeriod"><option value="7">Últimos 7 dias</option><option value="30" selected>Últimos 30 dias</option><option value="90">Últimos 90 dias</option><option value="custom">Personalizado</option></select></label>
    <label>De<input id="analyticsFrom" type="date" required></label><label>Até<input id="analyticsTo" type="date" required></label>
    <label>Nicho<select id="analyticsNiche"><option value="">Todos</option></select></label>
    <label>Plano<select id="analyticsPlan"><option value="">Todos</option><option value="free">Grátis</option><option value="pro">Pro</option><option value="premium">Premium</option></select></label>
    <label>Origem<select id="analyticsSource"><option value="">Todas</option></select></label>
    <label>Card<select id="analyticsItem"><option value="">Todos</option></select></label>
    <label>Pagamentos<select id="analyticsEnvironment"><option value="live">Produção</option><option value="test">Sandbox / teste</option><option value="unknown">Legado sem ambiente identificado</option></select></label>
    <button type="submit" class="primary" id="analyticsApply">Aplicar filtros</button>
   </form><p id="analyticsStatus" class="analytics-status" role="status">Selecione um período para consultar os resultados.</p><div id="analyticsContent"></div>
   <details class="analytics-privacy"><summary>Como interpretar os dados</summary><p>Navegação é opcional e depende de consentimento. Visitantes representam navegadores, não pessoas identificadas; retorno significa mais de uma sessão no período. Exposição de card exige pelo menos metade da imagem visível por um segundo. Não guardamos respostas, buscas digitadas, conversas, e-mails ou IPs na telemetria.</p><p>Checkouts e pagamentos são registros operacionais do servidor, independentes do consentimento. Abandono é estimado quando um checkout tem mais de 24 horas sem pagamento registrado; pendentes e recusados ficam separados. Pagamento posterior atualiza a classificação. Conversão usa a coorte de checkouts iniciados no período, com confirmações recebidas até a consulta.</p><p>Valores são de pagamentos BRL confirmados, separados de sandbox. Reembolsos e chargebacks atualizam os valores da venda original; receita líquida não desconta taxas ou impostos. Histórico importado é parcial, pois antigas liberações não formavam um livro de transações. Autorização de assinatura não é considerada faturamento sem confirmação da cobrança.</p><p>Ativações/cancelamentos não equivalem a pagamentos. Cadastros, planos ativos e localização das empresas aparecem em um quadro global, fora dos filtros de navegação. Idade, gênero e localização de visitantes anônimos não são coletados. Dados de navegação têm janela de 90 dias; o histórico de visitantes do navegador expira em 30 dias.</p></details>`;
  document.querySelector('.main').append(section);
  function period(){const to=localDay(),days=Number(el('analyticsPeriod').value);if(!days)return;const from=new Date(to+'T12:00:00Z');from.setUTCDate(from.getUTCDate()-days+1);el('analyticsFrom').value=from.toISOString().slice(0,10);el('analyticsTo').value=to;}
  period();el('analyticsPeriod').onchange=()=>{period();};
  ['analyticsFrom','analyticsTo'].forEach(id=>el(id).onchange=()=>el('analyticsPeriod').value='custom');
  nav.onclick=()=>{document.querySelectorAll('[data-v]').forEach(b=>b.classList.toggle('active',b===nav));document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v===section));el('title').textContent='Resultados & Comportamento';if(!data)load();};
  function table(headers,rows){return rows.length?`<div class="analytics-table-scroll"><table class="analytics-table"><thead><tr>${headers.map(h=>`<th>${escape(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map((v,i)=>`<td class="${i?'numeric':''}">${escape(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'<p class="analytics-empty">Sem registros para este período e estes filtros.</p>';}
  function bars(rows,label,key){const max=Math.max(1,...rows.map(r=>Number(r[key])||0));return rows.length?`<div class="analytics-bars">${rows.map(row=>`<div class="analytics-bar"><div><span>${escape(label(row))}</span><b>${number(row[key])}</b></div><progress max="${max}" value="${Number(row[key])||0}" aria-label="${escape(label(row))}"></progress></div>`).join('')}</div>`:'<p class="analytics-empty">Aguardando dados de navegação autorizados.</p>';}
  const panel=(heading,body,wide=false)=>`<section class="analytics-section ${wide?'wide':''}"><h3>${escape(heading)}</h3>${body}</section>`;
  function fill(id,values,label){const select=el(id),current=select.value;select.innerHTML='<option value="">'+(id==='analyticsSource'?'Todas':'Todos')+'</option>'+[...new Set(values||[])].sort().map(v=>`<option value="${escape(v)}">${escape(label(v))}</option>`).join('');if(current&&!values.includes(current))select.add(new Option(current,current));select.value=current;}
  function render(){
    const s=data.summary,b=data.business,net=s.gross_cents-s.refunds_cents;
    fill('analyticsNiche',data.options.niches,v=>v);fill('analyticsSource',data.options.sources,v=>labels[v]||v);fill('analyticsItem',data.options.items,title);
    const kpis=[['Receita bruta',money(s.gross_cents),'Pagamentos aprovados no período'],['Receita após estornos',money(net),'Antes de taxas e impostos'],['Vendas confirmadas',number(s.sales),`${number(s.single_sales)} avulsas · ${number(s.subscription_payments)} cobranças de assinatura`],['Ticket médio',s.sales?money(s.gross_cents/s.sales):'—','Receita bruta por pagamento'],['Visitantes observados',number(s.visitors),'Navegadores com métricas permitidas'],['Sessões observadas',number(s.sessions),`${number(s.page_views)} páginas vistas`],['Conversão dos checkouts',percent(s.converted_checkouts,s.checkouts),`${number(s.converted_checkouts)} de ${number(s.checkouts)} checkouts iniciados`],['Visitantes recorrentes',number(s.returning_visitors),`${percent(s.returning_visitors,s.visitors)} com mais de uma sessão`]];
    const cards=table(['Card / solução','Exposições','Cliques','Aberturas','Favoritos','Soluções','Vendas','Receita após estornos'],data.cards.map(r=>[title(r.item_id),number(r.views),number(r.clicks),number(r.opens),number(r.favorites),number(r.solutions),number(r.sales),money(r.revenue_cents)]));
    el('analyticsContent').innerHTML=`<div class="analytics-kpis">${kpis.map(([label,value,hint])=>`<article class="analytics-kpi"><span>${escape(label)}</span><b>${escape(value)}</b><small>${escape(hint)}</small></article>`).join('')}</div><div class="analytics-grid">
     ${panel('Evolução no período','<div id="analyticsDaily"></div><details><summary>Tabela diária</summary>'+table(['Dia','Sessões','Cliques','Vendas','Receita bruta','Estornos'],data.daily.map(r=>[r.day,number(r.sessions),number(r.clicks),number(r.sales),money(r.gross_cents),money(r.refunds_cents)]))+'</details>')}
     ${panel('Jornada dos checkouts',bars([{label:'Iniciados',count:s.checkouts},{label:'Convertidos',count:s.converted_checkouts},{label:'Abandono estimado (24h)',count:s.abandoned},{label:'Pagamento pendente',count:s.pending},{label:'Recusados / cancelados',count:s.failed},{label:'Recentes, aguardando',count:s.recent}],r=>r.label,'count')+'<p>Classificação dos checkouts iniciados no período, atualizada com as confirmações disponíveis. Não é uma medição de todos os visitantes.</p>')}
     ${panel('Cards e soluções mais acessados',cards,true)}
     ${panel('Comportamento observado',table(['Ação','Ocorrências','Sessões'],data.behavior.map(r=>[labels[r.name]||r.name,number(r.events),number(r.sessions)])))}
     ${panel('Dispositivos',bars(data.devices,r=>labels[r.device]||r.device,'sessions'))}
     ${panel('Origem e campanhas',table(['Origem / campanha','Sessões','Cliques'],data.sources.map(r=>[(labels[r.source]||r.source)+(r.campaign?' · '+r.campaign:''),number(r.sessions),number(r.clicks)])))}
     ${panel('Origem dos checkouts',table(['Origem','Iniciados','Convertidos','Abandono estimado'],data.checkout_origins.map(r=>[labels[r.source]||r.source,number(r.checkouts),number(r.converted),number(r.abandoned)])))}
     ${panel('Nichos observados',bars(data.niches,r=>r.niche||'Não informado','sessions'))}
     ${panel('Planos durante a navegação',bars(data.plans,r=>labels[r.plan]||r.plan,'sessions'))}
     ${panel('Contas e assinaturas — visão global',table(['Indicador','Quantidade'],[['Cadastros no período',number(b.new_accounts_global)],['Planos ativos agora',number(b.active_plans_global)],['Assinaturas com cancelamento registrado no período',number(b.cancellations_global)]])+'<p>Cadastros e cancelamentos usam o período escolhido. Planos ativos representam o momento atual. Este quadro não é filtrado por card, origem, nicho ou plano.</p>')}
     ${panel('Localização informada pelas empresas — global',table(['Cidade / UF','Empresas'],b.locations_global.map(r=>[r.city+' / '+r.state,number(r.companies)]))+'<p>Informação cadastral atual, não geolocalização dos visitantes. Idade e gênero não são coletados.</p>')}
    </div>`;
    const daily=data.daily,max=Math.max(1,...daily.map(r=>Number(r.gross_cents)));
    el('analyticsDaily').innerHTML=`<div class="analytics-daily" aria-label="Receita bruta diária">${daily.map(r=>`<div class="analytics-day" title="${escape(r.day+': '+money(r.gross_cents))}"><span style="height:${Math.max(2,Number(r.gross_cents)/max*100)}px"></span></div>`).join('')}</div><p class="analytics-legend">Receita bruta por dia, em horário de São Paulo. A tabela diária contém os valores completos.</p>`;
    el('analyticsStatus').className='analytics-status';el('analyticsStatus').textContent=`Atualizado em ${date(data.generated_at)}. Coleta disponível desde ${date(data.started_at)}. Navegação considera apenas consentimentos; ${number(s.legacy_sales)} vendas de histórico parcial e ${number(s.unattributed_sales)} sem vínculo com checkout neste recorte.`;
    el('analyticsExport').disabled=false;
  }
  async function load(){
    const version=++revision,user=me?.id;data=null;el('analyticsContent').replaceChildren();el('analyticsExport').disabled=true;el('analyticsApply').disabled=true;el('analyticsStatus').className='analytics-status';el('analyticsStatus').textContent='Consultando resultados…';
    try{
      if(!user||!sb)throw new Error('Entre com sua conta de administrador.');
      const {data:auth,error}=await sb.auth.getSession();if(error||auth?.session?.user?.id!==user)throw new Error('Sua sessão mudou. Entre novamente.');
      const query=new URLSearchParams({action:'analytics-report',from:el('analyticsFrom').value,to:el('analyticsTo').value,niche:el('analyticsNiche').value,plan:el('analyticsPlan').value,source:el('analyticsSource').value,item_id:el('analyticsItem').value,environment:el('analyticsEnvironment').value});
      const r=await fetch('/api/diagnoses?'+query,{cache:'no-store',headers:{Authorization:'Bearer '+auth.session.access_token}});const result=await r.json();if(!r.ok)throw new Error(r.status===403?'Acesso exclusivo do administrador.':result.error||'Não foi possível consultar os resultados.');
    if(version!==revision||me?.id!==user)return;if(!result.summary||!result.business||!result.options||!Array.isArray(result.cards))throw new Error('Resposta de resultados incompleta.');applied=Object.fromEntries(query);data=result;render();
    }catch(error){if(version===revision){el('analyticsStatus').className='analytics-status error';el('analyticsStatus').textContent=error.message+' Nenhum resultado foi estimado. Tente novamente.';}}
    finally{if(version===revision)el('analyticsApply').disabled=false;}
  }
  el('analyticsFilters').onsubmit=event=>{event.preventDefault();load();};
  el('analyticsFilters').addEventListener('change',()=>{revision++;data=null;applied=null;el('analyticsContent').replaceChildren();el('analyticsExport').disabled=true;el('analyticsApply').disabled=false;el('analyticsStatus').className='analytics-status';el('analyticsStatus').textContent='Filtros alterados. Clique em Aplicar filtros para consultar este recorte.';});
  function csvCell(value){const text=String(value??'');return '"'+(/^(?:\s*[=+@-]|[\t\r\n])/.test(text)?"'":'')+text.replace(/"/g,'""')+'"';}
  function exportCSV(){
    if(!data||!applied)return;
    const rows=[['MIV Ecosystem','Resultados e comportamento'],['De',applied.from,'Até',applied.to,'Ambiente',applied.environment],['Nicho',applied.niche,'Plano',applied.plan,'Origem',applied.source,'Card',applied.item_id],[],['Dia','Sessões','Cliques','Vendas','Receita bruta (centavos)','Estornos (centavos)'],...data.daily.map(r=>[r.day,r.sessions,r.clicks,r.sales,r.gross_cents,r.refunds_cents]),[],['Card','Exposições','Cliques','Aberturas','Favoritos','Soluções','Vendas','Receita após estornos (centavos)'],...data.cards.map(r=>[title(r.item_id),r.views,r.clicks,r.opens,r.favorites,r.solutions,r.sales,r.revenue_cents])];
    const blob=new Blob(['\ufeff'+rows.map(r=>r.map(csvCell).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='miv-resultados-'+el('analyticsFrom').value+'-'+el('analyticsTo').value+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  el('analyticsExport').onclick=exportCSV;
  const previousLoad=loadAll;loadAll=async function(){await previousLoad();if(section.classList.contains('active'))await load();};
  el('logout').addEventListener('click',()=>{revision++;data=null;el('analyticsContent').replaceChildren();el('analyticsExport').disabled=true;});
  window.MivAdminAnalytics={load,csvCell};
})();
