const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const output = process.env.MIV_QA_OUTPUT || path.join(root, 'outputs', 'admin-commerce-qa');

function installSupabaseMock() {
  const mfa={getAuthenticatorAssuranceLevel:async()=>({data:{currentLevel:'aal1',nextLevel:'aal1'}})};
  const db={profiles:[{id:'admin-id',role:'admin',full_name:'Administrador de teste'}],
    subscription_plans:['pro','premium'].map((plan_key,i)=>({plan_key,price_cents:i?9790:4790,
      mark_monthly_limit:i?450:120,active:true,frequency:1,frequency_type:'months',sort_order:i,
      description:'Preserve this',updated_at:'2026-10-19T10:00:00Z'})),
    diagnosis_rules:[{id:'global',free_solution_limit:2,card_price_cents:1990,free_period:'lifetime',
      purchase_unit:'card',pro_mark_enabled:false,premium_mark_enabled:true,revision:1}],
    ecosystem_cards:[{item_id:'monthly-strategy-plan',shelf_key:'tools',title:'Plano Estrategico do Mes',
      price_cents:12900,price_label:'R$ 129,00',access_level:'Premium',active:true}]};
  window.__commerceDB=db;window.__commerceWrites=[];window.__commerceOffline=false;
  const sb={auth:{mfa,getSession:async()=>({data:{session:{user:{id:'admin-id'},access_token:'mock'}}}),signOut:async()=>({})},
    from(table){
      let filters=[],single=false,update=null;
      const q={select(){return q;},eq(k,v){filters.push([k,v]);return q;},order(){return q;},limit(){return q;},
        single(){single=true;return q;},maybeSingle(){single=true;return q;},update(row){update=row;return q;},
        upsert(row){update=row;return q;},
        then(resolve,reject){
          if(window.__commerceOffline)return Promise.resolve({data:null,error:{message:'Banco indisponivel'}}).then(resolve,reject);
          let rows=(db[table]||[]).filter(row=>filters.every(([k,v])=>row[k]===v));
          if(update){window.__commerceWrites.push({table,update});rows.forEach(row=>Object.assign(row,update,table==='diagnosis_rules'?{revision:row.revision+1}:{}));}
          return Promise.resolve({data:single?rows[0]||null:rows.map(r=>({...r})),error:null}).then(resolve,reject);
        }
      };return q;
    }};
  window.supabase={createClient:()=>sb};
}

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const server=http.createServer((req,res)=>{
    const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    if(!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',target.endsWith('.html')?'text/html; charset=utf-8':target.endsWith('.js')?'text/javascript; charset=utf-8':'application/octet-stream');
    res.end(fs.readFileSync(target));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    const page=await browser.newPage({viewport:{width:1440,height:1100}});
    const errors=[];page.on('pageerror',err=>errors.push(err.message));
    page.on('dialog',dialog=>dialog.accept());
    await page.addInitScript(installSupabaseMock);
    await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
    await page.route('**/api/config',route=>route.fulfill({json:{supabaseUrl:'https://mock.invalid',supabasePublishableKey:'mock'}}));
    await page.goto('http://127.0.0.1:'+server.address().port+'/admin.html');
    await page.waitForFunction(()=>document.getElementById('login').classList.contains('hidden'));
    await page.locator('[data-v="plans"]').click();
    await page.waitForFunction(()=>!document.getElementById('saveProPrice').disabled&&!document.getElementById('saveDiagnosisRules').disabled);
    assert.equal(await page.locator('#subProLimit').inputValue(),'120');
    assert.equal(await page.locator('#diagnosisCardPrice').inputValue(),'19,90');
    await page.locator('#subProPrice').fill('59,90');
    await page.locator('#saveProPrice').click();
    await page.waitForFunction(()=>window.__commerceDB.subscription_plans[0].price_cents===5990);
    assert.equal(await page.evaluate(()=>window.__commerceDB.subscription_plans[0].mark_monthly_limit),120);
    assert.equal(await page.evaluate(()=>window.__commerceDB.subscription_plans[0].description),'Preserve this');
    await page.locator('#diagnosisFreeLimit').fill('3');
    await page.locator('#diagnosisCardPrice').fill('24,90');
    await page.locator('#saveDiagnosisRules').click();
    await page.waitForFunction(()=>window.__commerceDB.diagnosis_rules[0].revision===2);
    assert.equal(await page.evaluate(()=>window.__commerceDB.diagnosis_rules[0].card_price_cents),2490);
    for(const width of [1440,768,390]){
      await page.setViewportSize({width,height:1100});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow at '+width);
      await page.screenshot({path:path.join(output,'plans-'+width+'.png'),fullPage:true});
    }
    await page.evaluate(()=>{window.__commerceOffline=true;return loadSubPlanAdmin();});
    assert.equal(await page.locator('#saveProPrice').isDisabled(),true);
    assert.match(await page.locator('#subPricesStatus').textContent(),/carregar/);
    assert.deepEqual(errors,[]);
    console.log('PASS Admin browser: loading, saved prices, preserved allowance, rules, offline state, screenshots 1440/768/390. Supabase simulated; no production writes.');
  }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
