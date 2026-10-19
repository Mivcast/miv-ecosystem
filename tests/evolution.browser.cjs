const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const {attach,authenticate,service}=require('./diagnosis-fixture.cjs');
const root=path.resolve(__dirname,'..');
const output=process.env.MIV_QA_OUTPUT||path.join(require('node:os').tmpdir(),'miv-evolution-qa');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
let browser;
const server=http.createServer(async(req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname==='/'?'/index.html':new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(file.startsWith(path.join(root,'private')+path.sep)){res.writeHead(404).end();return;}
  try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}
  catch{res.writeHead(404).end();}
});
(async()=>{
  await fs.mkdir(output,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=await chromium.launch({channel:process.env.MIV_TEST_BROWSER||'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  // Remote integrations are isolated; the research response below is a test fixture.
  await page.route('https://**/*',route=>route.abort());
  await attach(page);
  let researchRequests=0;
  await page.route('**/api/mark-ai',async route=>{researchRequests++;await route.fulfill({json:{cards:[{channel:'Instagram',title:'Instagram',description:'Movimento de teste: vídeos sobre dúvidas frequentes.',mark_strategy:'Teste uma série de respostas.',source:'Fonte de teste',source_url:'https://example.com/teste'}]}})});
  const url=`http://127.0.0.1:${server.address().port}`;
  await page.goto(url);await page.locator('.ev-card').first().waitFor();
  assert.equal(await page.locator('.ev-card').count(),20);
  assert.equal(await page.locator('.ev-question').count(),60);
  assert.equal(await page.locator('#marketingTrack .card').count(),10);
  assert.equal(await page.locator('#brandTrack .card').count(),4);
  assert.equal(await page.locator('#marketingTrack [data-open="clientes-marketing"],#marketingTrack [data-open="brindes"]').count(),0);
  const questions=[...service.points.values()].map(q=>({...q}));
  assert.equal(await page.evaluate(()=>EVOLUTION_DATA[0].cards[0].qs[0].steps),undefined,'Paid steps must not ship in public metadata');
  await authenticate(page);
  assert.equal(new Set(questions.map(q=>q.id)).size,60);
  assert.equal(new Set(questions.map(q=>q.why)).size,60);
  assert.equal(new Set(questions.map(q=>q.example)).size,60);
  for(const q of questions){assert(q.steps.length>=3);assert(q.steps.every(s=>s.length>20));}
  for(const q of questions){
    await page.locator(`[data-ev-info="${q.id}"]`).click();
    assert((await page.locator('.ev-dialog').innerText()).includes(q.why));
    await page.locator('[data-ev-deepen]').click();
    assert.equal(await page.locator('.ev-practical-example').innerText(),q.example);
    assert((await page.locator('.ev-dialog').innerText()).includes(q.steps[0]));
    assert.equal(await page.locator('[data-ev-resource]').count(),q.resources.length);
    await page.locator('[data-ev-close]').click();
  }
  assert.equal(await page.locator('.ev-map-summary').count(),1);
  assert.equal(await page.locator('.ev-summary-stats>div').count(),4);
  assert.equal(await page.locator('.ev-intro,.ev-toolbar').count(),0);
  assert.equal(await page.locator('#view-home #plano-mensal').count(),0);
  assert.equal(await page.locator('#toolsTrack [data-open="monthly-strategy-plan"]').count(),1);
  await page.locator('#toolsTrack [data-open="monthly-strategy-plan"]').click();
  assert(await page.locator('#monthlyPlanDialog').isVisible());
  assert(await page.locator('#monthlyPlanMonth').isVisible());
  assert.match(await page.locator('#monthlyPlanDialog').innerText(),/O QUE O DOSSIÊ ENTREGA/);
  await page.locator('#closeMonthlyPlan').click();
  // The catalog price must reach the badge, modal and paywall, not only checkout.
  await page.evaluate(()=>{getItem('monthly-strategy-plan').price='R$ 129,00';renderTools();});
  assert.match(await page.locator('#toolsTrack .card').filter({has:page.locator('[data-open="monthly-strategy-plan"]')}).innerText(),/129,00/);
  await page.locator('#toolsTrack [data-open="monthly-strategy-plan"]').click();
  assert.match(await page.locator('#buyMonthlyPlan').textContent(),/129,00/);
  assert.match(await page.locator('#monthlyPlanAccess').textContent(),/129,00/);
  await page.evaluate(()=>{mivUser={id:'qa-user'};openMonthlyPlanPaywall();});
  assert.match(await page.locator('#singlePrice').textContent(),/129,00/);
  await page.evaluate(()=>{closePaywall();mivUser=null;getItem('monthly-strategy-plan').price='R$ 99,00';renderTools();subscriptionPlans.pro.mark_monthly_limit=120;subscriptionPlans.premium.mark_monthly_limit=450;refreshSubscriptionPlanLabels();});
  assert.equal(await page.locator('[data-mark-limit="pro"]').textContent(),'120');
  assert.equal(await page.locator('[data-mark-limit="premium"]').textContent(),'450');
  assert.equal(await page.locator('.faq-grid').evaluate(grid=>getComputedStyle(grid).gridTemplateColumns.split(' ').length),3);
  await page.evaluate(()=>window.scrollTo(0,document.getElementById('analysisGrid').getBoundingClientRect().top+scrollY-110));
  await page.screenshot({path:path.join(output,'map-summary-desktop.png')});
  assert.equal(await page.locator('#recomendados').count(),0);
  assert.equal(await page.locator('.ev-q-status').count(),60);
  for(const stage of await page.locator('.ev-stage').all()){
    const positions=await stage.locator('.ev-card').evaluateAll(cards=>cards.map(card=>Math.round(card.getBoundingClientRect().top)));
    assert.equal(new Set(positions).size,1,'Five cards share one desktop row');
    assert.equal(positions.length,5);
  }
  assert.equal(await page.locator('.help-showcase .ecosystem-links>a').count(),4);
  assert.equal(await page.locator('.ev-movement-result').count(),0);
  assert.equal(researchRequests,0);
  assert.deepEqual(await page.locator('#view-home>section').evaluateAll(sections=>sections.slice(0,4).map(section=>section.id)),['heroCommerce','nicho','como-ajuda','analises']);
  for(const width of [2048,1440]){
    await page.setViewportSize({width,height:1000});
    const margins=await page.evaluate(()=>{
      const contentLeft=id=>{const element=document.getElementById(id);return element.getBoundingClientRect().left+parseFloat(getComputedStyle(element).paddingLeft)};
      return {analysis:contentLeft('analises'),marketing:contentLeft('marketing')};
    });
    assert(Math.abs(margins.analysis-margins.marketing)<1,'Analysis margins match other sections');
  }
  await page.evaluate(()=>window.scrollTo(0,document.getElementById('nicho').getBoundingClientRect().top+scrollY-110));
  await page.screenshot({path:path.join(output,'niche-desktop.png')});
  assert.equal(await page.locator('.ev-niche-list img').first().evaluate(image=>image.getBoundingClientRect().width),84);
  assert.equal(await page.locator('.ev-niche-list').evaluate(list=>getComputedStyle(list).gap),'6px');
  await page.locator('#como-ajuda').scrollIntoViewIfNeeded();
  await page.locator('.pillar-image').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  assert.equal(await page.locator('.pillar-image').count(),4);
  assert(await page.locator('.pillar-image').evaluateAll(images=>images.every(image=>image.naturalWidth>0)));
  await page.screenshot({path:path.join(output,'pillars-desktop.png')});
  await page.evaluate(()=>window.scrollTo(0,document.getElementById('concorrentes').getBoundingClientRect().top+scrollY-110));
  await page.screenshot({path:path.join(output,'competitors-compact.png')});
  await page.evaluate(()=>window.scrollTo(0,document.querySelector('.faq').getBoundingClientRect().top+scrollY-110));
  await page.screenshot({path:path.join(output,'faq-three-columns.png')});
  await page.locator('[data-ev-answer="base.mercado.demanda"][data-value="2"]').click();
  assert.equal(await page.locator('#evProgress').getAttribute('value'),'2');
  await page.reload();await page.locator('.ev-card').first().waitFor();
  assert.equal(await page.locator('[data-ev-answer="base.mercado.demanda"][data-value="2"]').getAttribute('aria-pressed'),'true');
  assert.match(await page.locator('[data-ev-row="base.mercado.demanda"] .ev-q-status').innerText(),/✓/);
  await authenticate(page);
  await page.locator('[data-ev-info="base.mercado.demanda"]').click();
  assert.match(await page.locator('.ev-dialog').innerText(),/Sem compradores suficientes/);
  await page.locator('[data-ev-deepen]').click();
  await page.locator('#evNote').fill('Evidência <script>não executar</script> & margem');
  await page.locator('[data-ev-save]').click();
  await page.locator('[data-ev-report]').click();
  assert.equal(await page.locator('.ev-report-question').count(),60);
  assert.equal(await page.locator('.ev-report-note script').count(),0);
  assert.match(await page.locator('.ev-report-note').innerText(),/Evidência <script>/);
  await page.locator('[data-ev-mode="detailed"]').click();
  assert.equal(await page.locator('.ev-report-question h4').count(),60);
  await page.emulateMedia({media:'print'});
  assert.equal(await page.locator('main').isVisible(),false);
  assert.equal(await page.locator('#evReportContent').isVisible(),true);
  await page.pdf({path:path.join(output,'relatorio-detalhado.pdf'),preferCSSPageSize:true,printBackground:true});
  await page.emulateMedia({media:'screen'});
  await page.locator('[data-ev-close]').click();
  await page.locator('[data-ev-group="0"]').click();
  await page.locator('[data-ev-niche="Cardiologista"]').click();
  assert.equal(await page.locator('#evProgress').getAttribute('value'),'0');
  assert.match(await page.locator('#currentNiche').innerText(),/Cardiologista/);
  await page.locator('[data-ev-answer="base.mercado.demanda"][data-value="0"]').click();
  await page.locator('[data-ev-solve="base.mercado.demanda"]').click();
  await page.locator('[data-ev-mark]').click();
  assert.match(await page.locator('#markInput').inputValue(),/Cardiologista.*Mercado e oportunidade/);
  await page.locator('#closeMark').click();
  // Simulate a paid account to verify the existing gated request and response rendering.
  await page.evaluate(()=>{mivUser={id:'test-only'};accessState.ready=true;accessState.plan='pro';getAuthToken=async()=>'test-token';});
  await page.locator('[data-competitor-channel="Instagram"]').click();
  await page.locator('.channel-instagram .ev-movement-result').waitFor();
  assert.equal(researchRequests,1);
  assert.equal(await page.locator('.ev-movement-result').count(),1);
  assert.match(await page.locator('.channel-instagram').innerText(),/Movimento de teste/);
  await page.locator('[data-analysis="completa"]').click();
  assert.equal(await page.locator('[data-ev-wizard-answer]').count(),45);
  await page.locator('[data-ev-step="3"]').first().click();
  assert(await page.locator('[data-ev-finish]').isDisabled());
  for(let step=0;step<4;step++){
    await page.locator(`[data-ev-step="${step}"]`).first().click();
    const ids=await page.locator('[data-ev-wizard-answer][data-value="2"]').evaluateAll(buttons=>buttons.map(button=>button.dataset.evWizardAnswer));
    for(const id of ids)await page.locator(`[data-ev-wizard-answer="${id}"][data-value="2"]`).click();
  }
  await page.locator('[data-ev-finish]').click();
  assert.equal(await page.locator('.ev-report-question').count(),60);
  assert.equal(await page.locator('.ev-report-question h4').count(),60);
  assert.match(await page.locator('#evReportContent').innerText(),/60 de 60 pontos respondidos/);
  await page.locator('[data-ev-close]').click();
  assert.equal(await page.locator('#evProgress').getAttribute('value'),'100');
  await page.evaluate(()=>{accessState.plan='pro';});
  assert.equal(await page.evaluate(()=>hasItemAccess(getItem('monthly-strategy-plan'))),false);
  assert.equal(await page.evaluate(()=>hasItemAccess({id:'premium-only-test',access:'Premium'})),false);
  await page.evaluate(()=>{accessState.plan='premium';});
  await page.locator('#toolsTrack [data-open="monthly-strategy-plan"]').click();
  await page.locator('#monthlyPlanMonth').selectOption('11');
  await page.locator('#generateMonthlyPlan').click();
  assert(await page.locator('#monthlyPlanResult.show').isVisible());
  assert.match(await page.locator('#monthlyPlanResult').innerText(),/Novembro/);
  await page.screenshot({path:path.join(output,'monthly-plan-modal.png')});
  await page.locator('#closeMonthlyPlan').click();
  await page.setViewportSize({width:2048,height:1200});
  await page.evaluate(()=>window.scrollTo(0,document.querySelector('.ev-stage').getBoundingClientRect().top+scrollY-110));
  await page.locator('.ev-visual img').first().evaluate(image=>image.decode());
  assert.equal(await page.locator('.ev-visual img').evaluateAll(images=>images.every(image=>image.getAttribute('src').startsWith('assets/'))),true);
  await page.screenshot({path:path.join(output,'desktop.png')});
  for(const width of [1440,1100,768,390,320]){
    await page.setViewportSize({width,height:900});
    await page.evaluate(()=>window.scrollTo(0,document.getElementById('analysisGrid').getBoundingClientRect().top+scrollY-110));
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
    assert.equal(overflow,false,`Page overflow at ${width}px`);
    if(width===390)await page.screenshot({path:path.join(output,'mobile.png')});
    if(width===390||width===320){
      await page.locator('#toolsTrack [data-open="monthly-strategy-plan"]').click();
      assert(await page.locator('#monthlyPlanDialog').evaluate(modal=>modal.scrollWidth<=modal.clientWidth+1),'Monthly modal fits mobile width');
      await page.locator('#closeMonthlyPlan').click();
      await page.evaluate(()=>MivEvolution.openComplete());
      assert(await page.locator('.ev-dialog').evaluate(modal=>modal.scrollWidth<=modal.clientWidth+1),'Full analysis fits mobile width');
      await page.locator('[data-ev-close]').click();
    }
  }
  await page.evaluate(()=>applyTheme('Restaurante','food',false));
  assert.equal(await page.locator('.ev-movement-result').count(),0);
  await page.locator('#needInput').fill('Quero vender mais pelo WhatsApp');
  await page.locator('#needSuggest').click();
  assert(await page.locator('#needResults .card').count()>0);
  // Explicit legacy migrations preserve old bytes and never reuse changed concepts.
  const legacy=await page.evaluate(()=>{
    mivUser=null;mivActiveCompanyId=null;state.profile.niche='Teste de migração';
    const key='mivEvolution:v1:visitor:business:Teste de migração';
    const raw=JSON.stringify({'base.mercado.0':{answer:0,note:'Nota anterior preservada'},'base.mercado.1':{answer:2,note:'Procura validada'},'base.modelo.1':{answer:0,note:'Recorrência antiga'},'vendas.atracao.2':{answer:2}});
    localStorage.setItem(key,raw);MivEvolution.render();
    return {key,raw,migrated:JSON.parse(localStorage.getItem(key.replace(':v1:',':v2:')))};
  });
  assert.equal(legacy.migrated['base.mercado.demanda'].answer,2);
  assert.equal(legacy.migrated['base.mercado.demanda'].note,'Procura validada');
  assert.equal(legacy.migrated['base.mercado.concorrencia'],undefined);
  assert.equal(legacy.migrated['base.modelo.responsabilidades'],undefined);
  assert.equal(legacy.migrated['vendas.atracao.diversificacao'].answer,0);
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),legacy.key),legacy.raw);
  await page.locator('.ev-assessment-note button').click();
  assert.match(await page.locator('.ev-dialog').innerText(),/Nota anterior preservada/);
  await page.locator('[data-ev-close]').click();
  await page.evaluate(()=>{state.profile.niche='Teste de não aplicação';MivEvolution.render()});
  await page.locator('[data-ev-answer="base.mercado.demanda"][data-value="2"]').click();
  await page.locator('[data-ev-answer="cres.ticket.opcoes-valor"][data-value="na"]').click();
  await page.locator('[data-ev-na-save]').click();
  assert.match(await page.locator('[data-ev-na-error]').innerText(),/Explique o motivo/);
  await page.locator('#evNaReason').fill('O contrato padronizado não permite versões adicionais.');
  await page.locator('[data-ev-na-save]').click();
  await page.locator('[data-ev-report]').click();
  const overview=await page.locator('.ev-report-overview b').allTextContents();
  assert.equal(overview[1],'100%','Non-applicable answers must not reduce the declared score');
  assert.match(await page.locator('#evReportContent').innerText(),/2 de 60 pontos respondidos/);
  assert.match(await page.locator('#evReportContent').innerText(),/O contrato padronizado/);
  await page.locator('[data-ev-close]').click();
  await page.reload();await page.locator('.ev-card').first().waitFor();
  // The test niche wasn't saved in the shared profile; its state remains available.
  await page.evaluate(()=>{state.profile.niche='Teste de não aplicação';MivEvolution.render()});
  assert.equal(await page.locator('[data-ev-answer="cres.ticket.opcoes-valor"][data-value="na"]').getAttribute('aria-pressed'),'true');
  const library=await page.evaluate(()=>{
    const ids=[...libraryVisibleIds('marketing'),...libraryVisibleIds('sales'),...libraryVisibleIds('brand')];
    accessState.plan='free';accessState.purchases=new Set();
    const access=ids.map(id=>({id,access:getItem(id).access,price:getItem(id).price,allowed:hasItemAccess(getItem(id))}));
    const expected=['equipe-marketing','identidade','whatsapp','oferta'];
    const preserved=libraryMigrationLinks.every(link=>businessChecklistDefinitions.followup.sections.some((section,si)=>section.items.some(item=>`${si}:${item[0]}`===link.to)));
    const sample=libraryMigrationLinks.find(link=>link.storage==='mivMarketingChecklist:brindes');
    localStorage.setItem(sample.storage,JSON.stringify({[sample.from]:'correct'}));
    const merged=getBusinessChecklistState('followup');
    return {ids,access,expected,preserved,merged:merged[sample.to],original:JSON.parse(localStorage.getItem(sample.storage))[sample.from]};
  });
  assert.equal(new Set(library.ids).size,14);
  assert.deepEqual(library.access.filter(item=>!item.allowed).map(item=>item.id).sort(),library.expected.sort());
  assert.equal(library.preserved,true);
  assert.equal(library.merged,'correct');assert.equal(library.original,'correct');
  await page.evaluate(()=>openItem('clientes-marketing'));
  assert.equal(await page.evaluate(()=>state.current.id),'followup');
  assert.match(await page.locator('#detailBody').innerText(),/Recompensas e benefícios/i);
  await page.evaluate(()=>{accessState.plan='pro';openItem('whatsapp')});
  assert.match(await page.locator('#detailBody').innerText(),/Modelos para adaptar/);
  assert.deepEqual(errors,[]);
  console.log('PASS: 20 cards, 60 questions, persistence, scoped niches, notes, safe text, report modes, print, MARK context, on-demand research fixture and responsive widths.');
  console.log('Artifacts: '+output);
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>{await browser?.close();server.close();});
