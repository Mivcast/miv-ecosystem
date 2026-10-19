const test=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const handler=require('../api/diagnoses.js');
const service=require('../private/diagnosis-service.cjs');
const uid='11111111-1111-4111-8111-111111111111';
const other='22222222-2222-4222-8222-222222222222';
const rule={id:'global',free_period:'lifetime',purchase_unit:'card',free_solution_limit:2,card_price_cents:1990,pro_mark_enabled:false,premium_mark_enabled:true,revision:1};
const grant={allowed:false,plan:'free',free_points:[],paid_cards:[],free_remaining:2,card_price_cents:1990,mark_allowed:false};
async function run(fn,request,options={}){
 const env=['SUPABASE_URL','SUPABASE_SECRET_KEY','SUPABASE_PUBLISHABLE_KEY','GEMINI_API_KEY','MERCADOPAGO_ACCESS_TOKEN','MERCADOPAGO_WEBHOOK_SECRET'];
 const prior=Object.fromEntries(env.map(k=>[k,process.env[k]]));env.forEach(k=>process.env[k]='test-only');
 const oldFetch=global.fetch,calls=[];
 const response=(data,status=200)=>({ok:status>=200&&status<300,status,json:async()=>data});
 global.fetch=async(url,opt={})=>{
  calls.push({url,opt});
  if(url.includes('/auth/v1/user'))return response({id:uid,email:'qa@example.invalid'});
  if(url.includes('/diagnosis_rules?'))return response([{...rule,...options.rule}]);
  if(url.endsWith('/rpc/diagnosis_access'))return response({...grant,...options.grant});
  if(url.endsWith('/rpc/diagnosis_save_point'))return response({data:{[JSON.parse(opt.body).p_point_id]:JSON.parse(opt.body).p_data},updated_at:'2026-10-19'});
  if(url.includes('/diagnosis_workspaces?'))return response([{data:{},updated_at:null}]);
  if(url.includes('/company_users?'))return response([]);
  if(url.includes('/user_subscriptions?'))return response(options.plan?[{plan:options.plan,current_period_end:'2099-01-01T00:00:00Z'}]:[]);
  if(url.includes('/user_reports?'))return response([{...JSON.parse(opt.body)}]);
  if(url.includes('/user_purchases?'))return response([{id:'purchase-test',...JSON.parse(opt.body)}]);
  if(url.includes('/checkout/preferences'))return response({id:'preference-test',init_point:'https://checkout.example.invalid'});
  if(url.includes('/v1/payments/'))return response(options.payment||{});
  throw new Error('Unexpected test network path: '+url);
 };
 let status=200,data;
 const res={setHeader(){},status(s){status=s;return this},json(d){data=d;return d},end(){}};
 try{await fn({method:'POST',headers:{authorization:'Bearer fixture'},body:{niche:'QA',...request.body},...request},res);return {status,data,calls};}
 finally{global.fetch=oldFetch;env.forEach(k=>{if(prior[k]===undefined)delete process.env[k];else process.env[k]=prior[k]});}
}
test('unauthenticated solution requests are denied',async()=>{
 const result=await run(handler,{headers:{},body:{action:'unlock',point_id:'base.mercado.demanda',niche:'QA'}});assert.equal(result.status,401);
});
test('public rules never include private content',async()=>{
 const result=await run(handler,{method:'GET',headers:{},query:{action:'rules'}});assert.equal(result.status,200);assert.equal(result.data.solutions,undefined);
});

test('public config preserves the browser contract without authentication or database calls',async()=>{
 const result=await run(handler,{method:'GET',headers:{},query:{action:'public-config'}});
 assert.equal(result.status,200);
 assert.deepEqual(result.data,{supabaseUrl:'test-only',supabasePublishableKey:'test-only'});
 assert.equal(result.calls.length,0);
});

test('private source remains blocked even when requesting public config',async()=>{
 const result=await run(handler,{method:'GET',headers:{},query:{action:'public-config',blocked_source:'1'}});
 assert.equal(result.status,404);assert.equal(result.data,undefined);assert.equal(result.calls.length,0);
});
test('free snapshot and denied unlock never include solution text',async()=>{
 const snap=await run(handler,{method:'GET',query:{niche:'QA'}});assert.deepEqual(snap.data.solutions,{});
 const unlock=await run(handler,{body:{niche:'QA',action:'unlock',point_id:'base.mercado.demanda'}});assert.equal(unlock.status,402);assert.equal(unlock.data.solution,null);
});
test('entitled unlock returns only the requested solution',async()=>{
 const result=await run(handler,{body:{niche:'QA',action:'unlock',point_id:'base.mercado.demanda'}},{grant:{allowed:true,free_points:['base.mercado.demanda']}});
 assert.equal(result.status,200);assert.equal(result.data.solution.id,'base.mercado.demanda');assert.equal(result.data.solution.steps.length,3);
});
test('another company is rejected and user IDs from the body are ignored',async()=>{
 const denied=await run(handler,{method:'GET',query:{niche:'QA',company_id:other}});assert.equal(denied.status,403);
 const saved=await run(handler,{body:{niche:'QA',action:'save',point_id:'base.mercado.demanda',user_id:other,data:{answer:2,note:'Test'}}});
 const rpc=saved.calls.find(c=>c.url.endsWith('diagnosis_save_point'));assert.equal(JSON.parse(rpc.opt.body).p_user_id,uid);
});
test('invalid answers and non-applicable values do not reach persistence',async()=>{
 assert.throws(()=>service.validatePointData('base.mercado.demanda',{answer:'na',naReason:'Not valid here'}));
 assert.throws(()=>service.validatePointData('base.mercado.demanda',{answer:100}));
 assert.throws(()=>service.validatePointData('base.mercado.demanda',{note:'x'.repeat(5001)}));
});
test('report cannot inject solutions that have not been unlocked',async()=>{
 const result=await run(handler,{body:{niche:'QA',action:'report',report_id:other,solutions:{'base.mercado.demanda':{steps:['fake']}}}});
 assert.deepEqual(result.data.report.meta.solutions,{});assert.equal(result.data.report.meta.owner_id,uid);
});
test('checkout uses the server price and owner instead of supplied amounts',async()=>{
 const result=await run(require('../api/create-mercadopago-preference.js'),{body:{item_id:'diagnosis:mercado',amount:0,user_id:other}});
 assert.equal(result.status,200);const preference=JSON.parse(result.calls.find(c=>c.url.includes('/checkout/preferences')).opt.body);
 assert.equal(preference.items[0].unit_price,19.9);assert.equal(preference.metadata.miv_user_id,uid);
});
test('Pro cannot call analysis AI or diagnostic MARK context',async()=>{
 const result=await run(require('../api/analysis-ai.js'),{body:{analysis_id:'empresa'}},{plan:'pro'});assert.equal(result.status,403);
 const mark=await run(require('../api/mark-ai.js'),{body:{question:'Test',context:{diagnosis_point_id:'base.mercado.demanda'}}},{plan:'pro'});assert.equal(mark.status,403);
});
test('approved webhook unlocks the original price even after catalog price changes',async()=>{
 const ts=String(Date.now()),rid='qa-request',id='123';
 const signature=crypto.createHmac('sha256','test-only').update(`id:${id};request-id:${rid};ts:${ts};`).digest('hex');
 const payment={id,status:'approved',transaction_amount:19.9,metadata:{miv_user_id:uid,miv_item_id:'diagnosis:mercado',miv_item_type:'card',miv_expected_amount_cents:1990}};
 const result=await run(require('../api/mercadopago/webhook.js'),{url:'/api/mercadopago/webhook?data.id=123',headers:{'x-request-id':rid,'x-signature':`ts=${ts},v1=${signature}`},body:{type:'payment',data:{id}}},{payment,rule:{card_price_cents:2490}});
 assert.equal(result.status,200);const purchase=result.calls.find(c=>c.url.includes('/user_purchases?'));assert(purchase);assert.equal(JSON.parse(purchase.opt.body).amount_cents,1990);
});
test('unapproved payments and invalid signatures do not unlock any card',async()=>{
 const ts=String(Date.now()),rid='qa-request',id='123';
 const signature=crypto.createHmac('sha256','test-only').update(`id:${id};request-id:${rid};ts:${ts};`).digest('hex');
 const req={url:'/api/mercadopago/webhook?data.id=123',headers:{'x-request-id':rid,'x-signature':`ts=${ts},v1=${signature}`},body:{type:'payment',data:{id}}};
 const pending=await run(require('../api/mercadopago/webhook.js'),req,{payment:{id,status:'pending'}});
 assert.equal(pending.calls.some(c=>c.url.includes('/user_purchases?')),false);
 const invalid=await run(require('../api/mercadopago/webhook.js'),{...req,headers:{...req.headers,'x-signature':'ts=1,v1=deadbeef'}});
 assert.equal(invalid.status,401);assert.equal(invalid.calls.some(c=>c.url.includes('/user_purchases?')),false);
});
