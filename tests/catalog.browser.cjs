const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium,webkit}=require('playwright'),{attach,authenticate}=require('./diagnosis-fixture.cjs');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html'));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return res.writeHead(404).end();res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css':'application/octet-stream');res.end(fs.readFileSync(file));});
(async()=>{let browser;await new Promise(r=>server.listen(0,'127.0.0.1',r));try{
 browser=process.env.MIV_WEBKIT_PATH?await webkit.launch({executablePath:process.env.MIV_WEBKIT_PATH,headless:true}):await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.route('https://**/*',r=>r.abort());await attach(page);
 await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('#marketingTrack .card').first().waitFor();
 assert.equal(await page.locator('.ev-question').count(),60);
 const first=page.locator('[data-ev-row="base.mercado.demanda"]');
 assert.match(await first.innerText(),/Já faço bem/);assert.match(await first.innerText(),/Faço, mas posso melhorar/);assert.match(await first.innerText(),/Ainda não faço/);
 await first.locator('[data-value="2"]').click();assert.match(await page.locator('.ev-overall-health').innerText(),/100%/);
 await page.locator('[data-ev-answer="base.mercado.concorrencia"][data-value="1"]').click();
 await page.locator('[data-ev-answer="base.mercado.mudancas"][data-value="0"]').click();
 assert.match(await page.locator('.ev-stage-score').first().innerText(),/50%/);assert.match(await page.locator('.ev-overall-health').innerText(),/50%/);
 fs.mkdirSync(path.join(root,'outputs','catalog-qa'),{recursive:true});await first.screenshot({path:path.join(root,'outputs','catalog-qa','answers-mobile.png')});
 const search=page.locator('.ev-finder input');await search.fill('redes sociais');
 await page.waitForFunction(()=>document.querySelectorAll('.ev-search-match').length>0);assert(await page.locator('.ev-finder button').count()>0);
 await page.locator('.ev-finder button').first().click();assert(await page.locator('.ev-dialog').isVisible());await page.locator('[data-ev-close]').click();
 await page.locator('#nicheSearch').fill('numismatica');await page.locator('#applyNiche').click();assert.equal(await page.evaluate(()=>state.profile.niche),'Numismática');
 await authenticate(page);
 await page.evaluate(()=>{mivSupabase.from=()=>({select(){return this;},eq(){return this;},maybeSingle:async()=>({data:{niche:'Dentista',dynamic_events:[{name:'Evento de outro nicho'}],dynamic_sources:[]}})});localStorage.setItem('mivCalendarPrefs',JSON.stringify({niche:'Dentista',dynamicEvents:[{name:'Evento antigo'}]}));});
 await page.evaluate(()=>openCalendar());assert.equal(await page.locator('#calNiche').inputValue(),'Numismática');assert(await page.locator('#calNiche').isDisabled());assert.deepEqual(await page.evaluate(()=>calDynamicEvents),[]);
 await page.locator('#calClose').click();await page.evaluate(()=>MivEvolution.openComplete());assert.match(await page.locator('.ev-dialog').innerText(),/Faço, mas posso melhorar/);await page.locator('[data-ev-close]').click();
 await search.fill('');await page.evaluate(()=>window.scrollTo(0,0));
 for(const width of [375,390,440,768,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page overflow at '+width);const bad=await page.locator('.ev-choices button').evaluateAll(buttons=>buttons.filter(b=>b.scrollWidth>b.clientWidth+1).length);assert.equal(bad,0,'Answer text clipping at '+width);}
 assert.deepEqual(errors,[]);console.log('PASS: new answer levels 2/1/0, point/card/stage/overall scoring, topic search, canonical Numismatica, stale calendar ignored, complete analysis, mobile text and layout.');
 }finally{await browser?.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
