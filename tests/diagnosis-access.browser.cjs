const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const {attach,authenticate,service}=require('./diagnosis-fixture.cjs');
const root=path.resolve(__dirname,'..');
const output=process.env.MIV_QA_OUTPUT||path.join(root,'outputs','diagnosis-qa');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg'};
const server=http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':decodeURIComponent(pathname)));
 if(!file.startsWith(root+path.sep)||file.startsWith(path.join(root,'private')+path.sep)){res.writeHead(404).end();return;}
 try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404).end();}
});
(async()=>{
 await fs.mkdir(output,{recursive:true});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
  const fixture=await attach(page,'free');const url='http://127.0.0.1:'+server.address().port;
  await page.goto(url);await page.locator('.ev-card').first().waitFor();
  assert.equal((await page.request.get(url+'/private/diagnosis-content.json')).status(),404);
  await page.locator('[data-ev-solve="base.mercado.demanda"]').click();
  assert.equal(await page.locator('#authModal.show').count(),1);assert.equal(await page.locator('.ev-practical-example').count(),0);
  await page.locator('#authClose').click();await authenticate(page,'account-a');
  for(const id of ['base.mercado.demanda','base.mercado.concorrencia']){
   await page.locator(`[data-ev-solve="${id}"]`).click();await page.locator('[data-ev-free]').click();
   await page.locator('.ev-practical-example').waitFor();assert.equal(await page.locator('[data-ev-mark]').count(),0);
   if(id.endsWith('.demanda')){await page.locator('#evNote').fill('Rascunho da conta A');await page.locator('[data-ev-save]').click();await page.waitForFunction(()=>!document.querySelector('.ev-dialog'));}
   else await page.locator('[data-ev-close]').click();
  }
  assert.equal(fixture.free.get('account-a').size,2);
  await page.locator('[data-ev-solve="base.mercado.demanda"]').click();await page.locator('.ev-practical-example').waitFor();await page.locator('[data-ev-close]').click();
  assert.equal(fixture.free.get('account-a').size,2);
  await page.locator('[data-ev-solve="base.mercado.mudancas"]').click();
  assert.equal(await page.locator('[data-ev-free]').count(),0);assert.match(await page.locator('[data-ev-buy]').innerText(),/19,90/);
  for(const width of [390,320]){await page.setViewportSize({width,height:900});assert(await page.locator('.ev-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'Paywall fits mobile');await page.screenshot({path:path.join(output,'free-limit-'+width+'.png')});}
  await page.setViewportSize({width:1440,height:1000});
  await page.screenshot({path:path.join(output,'free-limit.png')});await page.locator('[data-ev-buy]').click();
  assert.equal(await page.evaluate(()=>state.current.id),'diagnosis:mercado');await page.evaluate(()=>closePaywall());
  await page.locator('[data-ev-report]').click();await page.locator('[data-ev-mode="detailed"]').click();
  assert.equal(await page.locator('.ev-report-question h4').count(),2);
  assert(!(await page.locator('#evReportContent').innerText()).includes(service.points.get('base.mercado.mudancas').example));
  await page.locator('[data-ev-save-report]').click();await page.waitForFunction(()=>state.reports.some(r=>r.meta?.type==='evolution'));
  assert.equal(Object.keys(fixture.reports[0].meta.solutions).length,2);await page.locator('[data-ev-close]').click();
  fixture.setPlan('pro');await page.evaluate(()=>{accessState.plan='pro';return MivDiagnosis.hydrate(true)});
  await page.locator('[data-ev-solve="base.mercado.mudancas"]').click();await page.locator('.ev-practical-example').waitFor();
  assert.equal(await page.locator('[data-ev-mark]').count(),0);await page.locator('[data-ev-close]').click();
  assert.equal(fixture.free.get('account-a').size,2);
  fixture.setPlan('premium');await page.evaluate(()=>MivDiagnosis.hydrate(true));
  await page.locator('[data-ev-solve="base.mercado.mudancas"]').click();await page.locator('[data-ev-mark]').waitFor();
  await page.screenshot({path:path.join(output,'premium-solution.png')});await page.locator('[data-ev-close]').click();
  fixture.setPlan('free');fixture.buy('account-a','produto');await page.evaluate(()=>MivDiagnosis.hydrate(true));
  for(const id of ['base.produto.necessidade','base.produto.validacao','base.produto.mix-lucrativo'])assert(await page.evaluate(id=>!!MivDiagnosis.solution(id),id));
  await page.locator('[data-ev-answer="base.mercado.demanda"][data-value="2"]').click();await page.evaluate(()=>MivDiagnosis.flush());
  fixture.setOffline(true);await page.locator('[data-ev-answer="base.mercado.demanda"][data-value="0"]').click();
  await page.evaluate(()=>MivDiagnosis.flush().catch(()=>{}));assert.match(await page.locator('#evCloudStatus').innerText(),/Tente/);
  assert(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('mivDiagnosisPending:mivEvolution:v2:account-a:business:'+state.profile.niche))).length>0));
  fixture.setOffline(false);await page.evaluate(()=>MivDiagnosis.hydrate(true).then(()=>MivDiagnosis.flush()));
  assert.match(await page.locator('#evCloudStatus').innerText(),/salvas/);
  await authenticate(page,'account-b');assert.equal(await page.evaluate(()=>MivEvolution.localData()['base.mercado.demanda']),undefined);
  assert.equal(await page.evaluate(()=>!!MivDiagnosis.solution('base.produto.necessidade')),false);
  assert.deepEqual(errors,[]);
  console.log('PASS: guest, two lifetime free solutions, idempotent reopen, paywall, paid card, Pro/Premium, cloud report, offline retry, account isolation. Network fixture, no real charges.');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
