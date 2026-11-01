const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const {attach,authenticate}=require('./diagnosis-fixture.cjs');
const root=path.resolve(__dirname,'..');
const server=http.createServer(async(req,res)=>{
 const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html'));
 if(!file.startsWith(root+path.sep)||file.includes(path.sep+'private'+path.sep))return res.writeHead(404).end();
 try{res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404).end();}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
 try{
  browser=process.env.MIV_WEBKIT_PATH?await webkit.launch({headless:true,executablePath:process.env.MIV_WEBKIT_PATH}):await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://**/*',r=>r.abort());const fixture=await attach(page,'free');await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('.ev-card').first().waitFor();
  await page.evaluate(()=>applyTheme('Restaurante','food',false));
  await page.locator('#focusNiche').click();
  for(let i=0;i<8;i++)await page.locator('[data-quick-answer="unknown"]').click();
  assert.match(await page.locator('.quick-dialog').innerText(),/8 resposta\(s\).*fora da nota/);
  assert.match(await page.locator('.quick-dialog').innerText(),/Sem pontuação/);
  assert.equal(await page.locator('[data-quick-save]').count(),0);
  await page.locator('.quick-close').click();await authenticate(page);
  const initial=await page.evaluate(()=>MivEvolution.localData());
  await page.locator('#focusNiche').click();
  for(let i=0;i<8;i++)await page.locator('[data-quick-answer="1"]').click();
  assert.match(await page.locator('.quick-dialog').innerText(),/50%/);
  assert.deepEqual(await page.evaluate(()=>MivEvolution.localData()),initial,'No implicit writes from quick diagnosis');
  page.once('dialog',dialog=>dialog.accept());await page.locator('[data-quick-save]').click();
  await page.evaluate(()=>MivDiagnosis.flush());assert.equal(fixture.free.size,0,'Quick diagnosis never spends free solutions');
  const saved=await page.evaluate(()=>MivEvolution.localData());assert.equal(Object.values(saved).filter(v=>v?.answer===1).length,8);
  assert(await page.locator('[data-quick-save]').isDisabled());
  await page.evaluate(()=>{mivUser={id:'different-account'};});
  await page.locator('[data-quick-complete]').click();assert.equal(await page.locator('.quick-dialog').count(),0,'Account switch invalidates the result');
  assert.deepEqual(errors,[]);console.log('PASS quick flow: 8 questions, unknown exclusion, explicit save, account isolation');
 }finally{await browser?.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
