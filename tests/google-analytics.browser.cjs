const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises'),path=require('node:path');
const id='G-S6HK166JNZ',key='mivAnalyticsConsent:v2';
(async()=>{
 const source=await fs.readFile(path.resolve(__dirname,'../analytics.js'),'utf8');
 const browser=process.env.MIV_WEBKIT_PATH?await webkit.launch({executablePath:process.env.MIV_WEBKIT_PATH,headless:true}):await chromium.launch({channel:'chrome',headless:true});
 async function fixture({host='miv-ecosystem.vercel.app',route='home',gpc=false,old=null}={}){
  const page=await browser.newPage(),scripts=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(({route,gpc,old})=>{
   window.state={route,profile:{niche:'private niche'},current:{id:'public-card'},favorites:[]};window.mivUser=null;
   window.route=value=>{state.route=value;};
   if(gpc)Object.defineProperty(navigator,'globalPrivacyControl',{value:true});
   if(old)localStorage.setItem('mivAnalyticsConsent:v1',JSON.stringify({status:old}));
  },{route,gpc,old});
  await page.route('**/*',async r=>{
   const url=new URL(r.request().url());
   if(url.hostname==='www.googletagmanager.com'){scripts.push(url.href);return r.fulfill({contentType:'text/javascript',body:'window.__vendorFixture=true;'});}
   if(url.hostname===host&&url.pathname==='/')return r.fulfill({contentType:'text/html',body:'<!doctype html><html><head><title>Private fixture title</title></head><body><footer class="siteFooter"></footer><script>'+source+'</script></body></html>'});
   if(url.hostname===host&&url.pathname==='/api/diagnoses')return r.fulfill({json:{accepted:0}});
   return r.abort();
  });
  await page.goto('https://'+host+'/?email=secret@example.invalid#access_token=fixture-secret');
  return {page,scripts,errors};
 }
 const commands=page=>page.evaluate(()=>Array.from(window.dataLayer||[],entry=>Array.from(entry)));
 const latestConsent=list=>list.filter(x=>x[0]==='consent').at(-1)[2];
 try{
  const {page,scripts,errors}=await fixture();await page.waitForFunction(()=>window.__vendorFixture);
  assert.equal(scripts.length,1);assert(scripts[0].endsWith('?id='+id));
  let list=await commands(page);assert.equal(list[0][0],'consent');assert.equal(list[0][1],'default');assert.equal(latestConsent(list).analytics_storage,'denied');
  const cfg=list.find(x=>x[0]==='config');assert.equal(cfg[1],id);assert.equal(cfg[2].send_page_view,false);assert.equal(cfg[2].allow_google_signals,false);assert.equal(cfg[2].allow_ad_personalization_signals,false);
  assert(!JSON.stringify(list).includes('secret'));assert(!JSON.stringify(list).includes('private niche'));assert(!JSON.stringify(list).includes('Private fixture title'));
  assert.equal(await page.evaluate(()=>localStorage.getItem('mivAnalyticsVisitor:v1')),null);
  await page.locator('[data-analytics-reject]').click();list=await commands(page);assert.equal(latestConsent(list).analytics_storage,'denied');assert.equal(scripts.length,1);
  await page.evaluate(()=>MivAnalytics.preferences());await page.locator('[data-analytics-accept]').click();list=await commands(page);assert.equal(latestConsent(list).analytics_storage,'granted');for(const name of ['ad_storage','ad_user_data','ad_personalization'])assert.equal(latestConsent(list)[name],'denied');assert.equal(scripts.length,1);
  await page.evaluate(()=>{document.cookie='_ga=fixture; Path=/';document.cookie='_ga_S6HK166JNZ=fixture; Path=/';MivAnalytics.preferences();});await page.locator('[data-analytics-reject]').click();assert(!await page.evaluate(()=>document.cookie.includes('_ga')));assert.equal(latestConsent(await commands(page)).analytics_storage,'denied');
  const before=(await commands(page)).filter(x=>x[0]==='event').length;
  for(const route of ['central','report']){await page.evaluate(v=>window.route(v),route);assert.equal(await page.evaluate(id=>window['ga-disable-'+id],id),true);assert.equal((await commands(page)).filter(x=>x[0]==='event').length,before);}
  await page.evaluate(()=>window.route('home'));assert.equal(scripts.length,1);
  await page.evaluate(key=>{localStorage.setItem(key,JSON.stringify({status:'accepted'}));window.dispatchEvent(new StorageEvent('storage',{key}));},key);assert.equal(latestConsent(await commands(page)).analytics_storage,'granted');
  await page.evaluate(key=>{localStorage.setItem(key,JSON.stringify({status:'declined'}));window.dispatchEvent(new StorageEvent('storage',{key}));},key);assert.equal(latestConsent(await commands(page)).analytics_storage,'denied');assert.deepEqual(errors,[]);await page.close();
  for(const options of [{route:'central'},{route:'report'},{gpc:true},{host:'preview.example.invalid'}]){const f=await fixture(options);assert.equal(f.scripts.length,0);assert.deepEqual(f.errors,[]);await f.page.close();}
  for(const old of ['accepted','declined']){const f=await fixture({old});await f.page.waitForFunction(()=>window.__vendorFixture);assert.equal(latestConsent(await commands(f.page)).analytics_storage,'denied');assert.equal(await f.page.locator('#analyticsConsent').count(),old==='accepted'?1:0);await f.page.close();}
  console.log('PASS GA4 advanced: tag before choice, default denied, consent updates, ads denied, safe URL/title, cookie cleanup, cross-tab changes, private routes/GPC/preview excluded, old consent not reused. Vendor mocked; no Google analytics hits sent.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
