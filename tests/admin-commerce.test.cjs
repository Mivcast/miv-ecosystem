const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const rules = require('../commercial-rules.js');
const initial = { id:'global', free_period:'lifetime', purchase_unit:'card', free_solution_limit:2,
  card_price_cents:1990, pro_mark_enabled:false, premium_mark_enabled:true, revision:1,
  updated_at:'2026-10-19T10:00:00Z' };

function fixture({ unavailable=false, conflict=false }={}) {
  const nodes = new Map();
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, { value:'', disabled:true, checked:false, textContent:'',
      classList:{toggle(){}}, addEventListener(event, fn){this[event] = fn;} });
    return nodes.get(id);
  };
  const plans = ['pro','premium'].map((plan_key,i) => ({plan_key, price_cents:i?9790:4790,
    mark_monthly_limit:i?460:120, active:false, frequency:3, frequency_type:'months',
    description:'Custom description', updated_at:initial.updated_at }));
  let savedRules={...initial};
  const writes=[];
  const sb = { from(table) {
    let update=null, filters=[];
    const q = { select(){return q;}, order(){return q;}, single(){return q;},
      eq(k,v){filters.push([k,v]);return q;}, update(row){update=row;return q;},
      then(resolve,reject){
        if(unavailable)return Promise.resolve({data:null,error:new Error('offline')}).then(resolve,reject);
        let rows = table==='subscription_plans'?plans:table==='diagnosis_rules'?[savedRules]:[];
        rows=rows.filter(r=>filters.every(([k,v])=>r[k]===v));
        if(update){
          writes.push({table,update,filters});
          if(conflict)rows=[];
          else rows.forEach(r=>Object.assign(r,update,table==='diagnosis_rules'?{revision:r.revision+1}:{}));
        }
        const data=table==='diagnosis_rules'&&!update?rows[0]:rows.map(r=>({...r}));
        return Promise.resolve({data,error:null}).then(resolve,reject);
      }
    };return q;
  }};
  const ctx=vm.createContext({window:{MivCommercialRules:rules},$:node,sb,me:{id:'admin'},
    loadAll:async()=>{},confirm:()=>true,alert:()=>{},console});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../admin-commerce.js'),'utf8'),ctx);
  return {nodes,node,ctx,writes,plans,run:code=>vm.runInContext(code,ctx)};
}

test('exact BRL parsing rejects blank, negative, zero, thousands and excess precision',()=>{
  for(const [value,cents] of [['19,90',1990],['47.9',4790],['1',100],[' 97,90 ',9790]])assert.equal(rules.moneyToCents(value),cents);
  for(const value of ['',null,'-1','0','19.999','1.999,00','NaN','Infinity','1e3'])assert.throws(()=>rules.moneyToCents(value));
  assert.throws(()=>rules.validateRules({...initial,free_solution_limit:61}));
  assert.throws(()=>rules.validateRules({...initial,purchase_unit:'point'}));
  assert.throws(()=>rules.validateRules({...initial,free_period:'monthly'}));
  assert.throws(()=>rules.validateRules({...initial,pro_mark_enabled:'false'}));
});
test('plan edits preserve inactive state, billing cycle, description and custom allowance',async()=>{
  const f=fixture();await f.run('loadSubPlanAdmin()');
  assert.equal(f.node('subProLimit').value,120);
  f.node('subProPrice').value='59,90';f.node('subProLimit').value='120';
  await f.run("saveCommercialPlan('pro')");
  assert.equal(f.writes.length,1);
  assert.equal(f.plans[0].price_cents,5990);
  assert.equal(f.plans[0].mark_monthly_limit,120);
  assert.equal(f.plans[0].active,false);
  assert.equal(f.plans[0].frequency,3);
  assert.equal(f.plans[0].description,'Custom description');
  assert.deepEqual(Object.keys(f.writes[0].update).sort(),['mark_monthly_limit','price_cents','updated_at']);
});
test('invalid price and fractional allowance cannot write',async()=>{
  const f=fixture();await f.run('loadSubPlanAdmin()');
  f.node('subProPrice').value='';await f.run("saveCommercialPlan('pro')");
  f.node('subProPrice').value='49,90';f.node('subProLimit').value='1.5';await f.run("saveCommercialPlan('pro')");
  assert.equal(f.writes.length,0);
});
test('zero allowance remains an explicit valid administrator choice',async()=>{
  const f=fixture();await f.run('loadSubPlanAdmin()');
  f.node('subProPrice').value='47,90';f.node('subProLimit').value='0';await f.run("saveCommercialPlan('pro')");
  assert.equal(f.plans[0].mark_monthly_limit,0);
});
test('rules load, save minimal fields and preserve fixed commercial units',async()=>{
  const f=fixture();await f.run('loadDiagnosisRuleAdmin()');
  assert.equal(f.node('diagnosisCardPrice').value,'19,90');
  f.node('diagnosisCardPrice').value='24,90';f.node('diagnosisFreeLimit').value='3';
  await f.run('saveDiagnosisRuleAdmin()');
  assert.equal(f.writes[0].update.card_price_cents,2490);
  assert.equal(f.writes[0].update.free_solution_limit,3);
  assert.equal(f.writes[0].update.pro_mark_enabled,false);
  assert.equal(f.node('saveDiagnosisRules').disabled,false);
  assert.match(f.node('diagnosisRulesStatus').textContent,/2/);
});
test('database failures leave controls disabled, without guessed fallback data',async()=>{
  const f=fixture({unavailable:true});await f.run('loadSubPlanAdmin()');await f.run('loadDiagnosisRuleAdmin()');
  assert.equal(f.node('saveProPrice').disabled,true);
  assert.equal(f.node('saveDiagnosisRules').disabled,true);
  assert.equal(f.writes.length,0);
  assert.match(f.node('subPricesStatus').textContent,/offline/);
});
test('stale configuration cannot report success or overwrite another administrator',async()=>{
  const f=fixture({conflict:true});await f.run('loadDiagnosisRuleAdmin()');
  f.node('diagnosisFreeLimit').value='2';await f.run('saveDiagnosisRuleAdmin()');
  assert.equal(f.node('saveDiagnosisRules').disabled,true);
  assert.match(f.node('diagnosisRulesStatus').textContent,/Atualizar/);
});
test('MARK API honors a zero allowance without falling back to 80 interactions',async()=>{
  const handler=require('../api/mark-ai.js');
  const names=['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','SUPABASE_SECRET_KEY','GEMINI_API_KEY'];
  const previous=Object.fromEntries(names.map(name=>[name,process.env[name]]));
  const originalFetch=global.fetch;let status,body;
  names.forEach(name=>process.env[name]='test-only');
  global.fetch=async url=>{
    if(url.includes('/auth/v1/user'))return {ok:true,json:async()=>({id:'user-test'})};
    if(url.includes('/user_subscriptions?'))return {ok:true,json:async()=>[{plan:'pro',current_period_end:'2099-01-01T00:00:00Z'}]};
    if(url.includes('/subscription_plans?'))return {ok:true,json:async()=>[{mark_monthly_limit:0}]};
    if(url.includes('/mark_ai_usage?'))return {ok:true,json:async()=>[]};
    throw new Error('Unexpected network request');
  };
  try{
    const response={setHeader(){},status(code){status=code;return this;},json(data){body=data;return data;}};
    await handler({method:'POST',headers:{authorization:'Bearer mock'},body:{question:'Question'}},response);
    assert.equal(status,429);assert.equal(body.usage.limit,0);assert.equal(body.usage.plan,'pro');
  }finally{
    global.fetch=originalFetch;
    names.forEach(name=>{if(previous[name]===undefined)delete process.env[name];else process.env[name]=previous[name];});
  }
});
