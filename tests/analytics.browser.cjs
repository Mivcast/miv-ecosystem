const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const {attach}=require('./diagnosis-fixture.cjs');
const root=path.resolve(__dirname,'..'),output=path.join(root,'outputs','analytics-qa');
const server=http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 const file=path.resolve(root,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)||file.startsWith(path.join(root,'private')+path.sep)){res.writeHead(404).end();return;}
 try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':file.endsWith('.png')?'image/png':'image/jpeg');res.end(await fs.readFile(file));}catch{res.writeHead(404).end();}
});
function adminMock(){
 const data={profiles:[{id:'qa-admin',role:'admin',full_name:'QA Admin'}]};
 window.supabase={createClient:()=>({auth:{mfa:{getAuthenticatorAssuranceLevel:async()=>({data:{currentLevel:'aal1',nextLevel:'aal1'}})},getSession:async()=>({data:{session:{user:{id:'qa-admin'},access_token:'test-admin-token'}}}),signOut:async()=>({})},from(table){let single=false;const q={select(){return q;},eq(){return q;},order(){return q;},limit(){return q;},maybeSingle(){single=true;return q;},single(){single=true;return q;},then(resolve,reject){return Promise.resolve({data:single?(data[table]?.[0]||null):(data[table]||[]),error:null}).then(resolve,reject);}};return q;}})};
}
const report={started_at:'2026-10-20T10:00:00Z',generated_at:'2026-10-20T12:00:00Z',retention_days:90,
 summary:{visitors:10,sessions:12,returning_visitors:2,identified_users:4,page_views:30,sales:2,gross_cents:3980,refunds_cents:500,single_sales:2,subscription_payments:0,legacy_sales:0,unattributed_sales:0,checkouts:5,converted_checkouts:2,abandoned:1,pending:1,failed:1,recent:0},
 daily:[{day:'2026-10-19',sessions:5,clicks:7,sales:1,gross_cents:1990,refunds_cents:0},{day:'2026-10-20',sessions:7,clicks:8,sales:1,gross_cents:1990,refunds_cents:500}],
 cards:[{item_id:'diagnosis:mercado',views:20,clicks:8,opens:3,favorites:1,solutions:2,sales:2,revenue_cents:3480},{item_id:'<img src=x onerror=alert(1)>',views:1,clicks:1,opens:0,favorites:0,solutions:0,sales:0,revenue_cents:0}],
 behavior:[{name:'solution_view',events:2,sessions:2}],sources:[{source:'instagram',campaign:'outubro',sessions:12,clicks:15}],devices:[{device:'mobile',sessions:9},{device:'desktop',sessions:3}],niches:[{niche:'Médico',sessions:12}],plans:[{plan:'free',sessions:12}],checkout_origins:[{source:'instagram',checkouts:5,converted:2,abandoned:1}],
 business:{new_accounts_global:3,active_plans_global:4,cancellations_global:1,locations_global:[{city:'São Paulo',state:'SP',companies:4}]},options:{niches:['Médico'],sources:['instagram'],items:['diagnosis:mercado']}};
(async()=>{
 await fs.mkdir(output,{recursive:true});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
 try{
  browser=await chromium.launch({channel:'chrome',headless:true});const base='http://127.0.0.1:'+server.address().port;
  const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
  await attach(page,'free',{analytics:true});const batches=[];
  await page.route('**/api/diagnoses',async route=>{const body=route.request().postDataJSON();if(body?.action!=='analytics-events')return route.fallback();batches.push(body);await route.fulfill({json:{accepted:body.events.length}});});
  await page.goto(base);await page.locator('#analyticsConsent').waitFor();await page.evaluate(()=>MivAnalytics.track('card_click','whatsapp'));await page.evaluate(()=>MivAnalytics.flush());assert.equal(batches.length,0);
  assert.equal(await page.evaluate(()=>localStorage.getItem('mivAnalyticsVisitor:v1')),null);
  await page.locator('[data-analytics-accept]').click();await page.evaluate(()=>MivAnalytics.flush());assert(batches.some(b=>b.events.some(e=>e.name==='page_view')));
  await page.locator('#marketingTrack').scrollIntoViewIfNeeded();await page.waitForTimeout(1300);await page.evaluate(()=>MivAnalytics.flush());
  assert(batches.some(b=>b.events.some(e=>e.name==='card_view')));
  const clicked=page.waitForRequest(req=>req.method()==='POST'&&req.url().includes('/api/diagnoses')&&req.postDataJSON()?.events?.some(e=>e.name==='card_click'&&e.item_id==='local'));
  await page.locator('#marketingTrack [data-open="local"]').click();await page.evaluate(()=>MivAnalytics.flush());await clicked;
  assert(batches.some(b=>b.events.some(e=>e.name==='card_click'&&e.item_id==='local')));
  assert(batches.some(b=>b.events.some(e=>e.name==='card_open'&&e.item_id==='local')));
  const privateText='patient-secret@example.invalid';await page.evaluate(value=>{const input=document.createElement('input');input.value=value;document.body.append(input);},privateText);
  await page.evaluate(()=>MivAnalytics.track('card_click','whatsapp'));await page.evaluate(()=>MivAnalytics.flush());assert(!JSON.stringify(batches).includes(privateText));
  for(const width of [320,390]){await page.setViewportSize({width,height:844});await page.evaluate(()=>MivAnalytics.preferences());assert(await page.locator('#analyticsConsent').evaluate(el=>el.getBoundingClientRect().right<=innerWidth));await page.screenshot({path:path.join(output,'consent-'+width+'.png')});}
  await page.locator('[data-analytics-reject]').click();const before=batches.length;await page.evaluate(()=>{MivAnalytics.track('card_click','whatsapp');return MivAnalytics.flush();});assert.equal(batches.length,before);assert.equal(await page.evaluate(()=>localStorage.getItem('mivAnalyticsVisitor:v1')),null);assert.deepEqual(await page.evaluate(()=>MivAnalytics.context()),{consent:false});
  await page.reload();assert.equal(await page.locator('#analyticsConsent').count(),0);await page.evaluate(()=>MivAnalytics.flush());assert.equal(batches.length,before);
  const protectedPage=await browser.newPage();await protectedPage.addInitScript(()=>Object.defineProperty(navigator,'globalPrivacyControl',{value:true}));await protectedPage.route('https://**/*',r=>r.abort());await attach(protectedPage,'free',{analytics:true});await protectedPage.goto(base);await protectedPage.evaluate(()=>MivAnalytics.preferences());assert(await protectedPage.locator('[data-analytics-accept]').isDisabled());assert.equal(await protectedPage.evaluate(()=>MivAnalytics.context().consent),false);await protectedPage.close();
  const admin=await browser.newPage({viewport:{width:1440,height:1000}});const adminErrors=[];admin.on('pageerror',e=>adminErrors.push(e.message));
  await admin.addInitScript(adminMock);await admin.route('https://cdn.jsdelivr.net/**',r=>r.abort());
  await admin.route('**/api/config',r=>r.fulfill({json:{supabaseUrl:'https://mock.invalid',supabasePublishableKey:'mock'}}));
  let offline=false;const reports=[];
  await admin.route('**/api/diagnoses?*',async r=>{const url=new URL(r.request().url());if(url.searchParams.get('action')!=='analytics-report')return r.fulfill({status:503,json:{error:'not available'}});reports.push(url);assert.equal(r.request().headers().authorization,'Bearer test-admin-token');return r.fulfill({status:offline?503:200,json:offline?{error:'Servidor de teste indisponível'}:report});});
  await admin.goto(base+'/admin.html');await admin.waitForFunction(()=>document.getElementById('login').classList.contains('hidden'));
  await admin.locator('[data-v="analytics"]').click();await admin.locator('.analytics-kpi').first().waitFor();assert.equal(await admin.locator('.analytics-kpi').count(),8);
  assert.match(await admin.locator('#analyticsContent').innerText(),/34,80/);assert.equal(await admin.locator('#analyticsContent img').count(),0);
  assert.equal(await admin.evaluate(()=>MivAdminAnalytics.csvCell('=HYPERLINK("x")')),'"\'=HYPERLINK(""x"")"');
  await admin.locator('#analyticsSource').selectOption('instagram');await admin.locator('#analyticsApply').click();await admin.waitForFunction(()=>!document.getElementById('analyticsApply').disabled);assert.equal(reports.at(-1).searchParams.get('source'),'instagram');
  const download=admin.waitForEvent('download');await admin.locator('#analyticsExport').click();assert.match((await download).suggestedFilename(),/^miv-resultados-/);
  for(const width of [1440,768,390,320]){await admin.setViewportSize({width,height:1000});assert.equal(await admin.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Admin overflow '+width);await admin.screenshot({path:path.join(output,'admin-'+width+'.png'),fullPage:true});}
  offline=true;await admin.locator('#analyticsApply').click();await admin.waitForFunction(()=>!document.getElementById('analyticsApply').disabled);assert.equal(await admin.locator('.analytics-kpi').count(),0);assert(await admin.locator('#analyticsExport').isDisabled());assert.match(await admin.locator('#analyticsStatus').innerText(),/Nenhum resultado foi estimado/);
  assert.deepEqual(errors,[]);assert.deepEqual(adminErrors,[]);
  console.log('PASS analytics browser: consent, impressions, clicks, content opens, opt-out, GPC, no form collection, admin filters, XSS safety, CSV and responsive/error states. Fixtures only.');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
