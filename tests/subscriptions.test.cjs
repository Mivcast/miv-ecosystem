const test=require('node:test');
const assert=require('node:assert/strict');
const uid='11111111-1111-4111-8111-111111111111';
const future='2099-01-01T00:00:00Z';
async function run(file,body={},options={}){
 const names=['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','SUPABASE_SECRET_KEY','MERCADOPAGO_ACCESS_TOKEN','MERCADOPAGO_TEST_PAYER_EMAIL'];
 const prior=Object.fromEntries(names.map(k=>[k,process.env[k]]));
 Object.assign(process.env,{SUPABASE_URL:'https://db.example.invalid',SUPABASE_PUBLISHABLE_KEY:'fixture',SUPABASE_SECRET_KEY:'fixture',MERCADOPAGO_ACCESS_TOKEN:options.test?'TEST-fixture':'live-fixture',MERCADOPAGO_TEST_PAYER_EMAIL:options.payer||''});
 const original=global.fetch,calls=[];
 const response=(data,status=200)=>({ok:status>=200&&status<300,status,json:async()=>data,text:async()=>JSON.stringify(data)});
 global.fetch=async(input,opt={})=>{
  const url=String(input);calls.push({url,...opt});
  if(url.includes('/auth/v1/user'))return response(options.guest?{}:{id:uid,email:'owner@example.invalid'});
  if(url.includes('/legal_acceptances?'))return response(options.terms===false?[]:[{version:'2026-10-20'}]);
  if(url.includes('/rpc/admin_access'))return response(options.adminMfa===true);
  if(url.includes('/profiles?'))return response([{role:'admin'}]);
  if(url.includes('/subscription_plans?'))return response(options.inactive&&url.includes('active=eq.true')?[]:[{plan_key:body.plan||'pro',name:'Fixture',active:!options.inactive,price_cents:6500,currency_id:'BRL',frequency:1,frequency_type:'months'}]);
  if(url.includes('/user_subscriptions?')){
   if(opt.method==='PATCH')return response([JSON.parse(opt.body)],options.saveFails?503:200);
   return response(options.rows||[]);
  }
  if(url.endsWith('/user_subscriptions'))return response([JSON.parse(opt.body)]);
  if(url.includes('api.mercadopago.com/preapproval')){
   if(opt.method==='POST')return response({id:'fixture-sub',status:'pending',init_point:'https://checkout.example.invalid/live',sandbox_init_point:'https://checkout.example.invalid/test'});
   return response({id:'fixture-sub',status:options.mpStatus||'authorized',next_payment_date:future},options.mpFails?502:200);
  }
  if(url.includes('/analytics_'))return response([]);
  throw Error('Unexpected fixture URL: '+url);
 };
 let status=200,data;
 const token='fixture.'+Buffer.from(JSON.stringify({sub:uid,aal:options.adminMfa?'aal2':'aal1'})).toString('base64url')+'.fixture';
 try{await require('../api/'+file)({method:options.method||'POST',headers:{authorization:'Bearer '+token,host:'example.invalid'},body}, {setHeader(){},status(s){status=s;return this;},json(d){data=d;}});return {status,data,calls};}
 finally{global.fetch=original;for(const k of names)if(prior[k]===undefined)delete process.env[k];else process.env[k]=prior[k];}
}
const providerWrites=r=>r.calls.filter(c=>c.url.includes('api.mercadopago.com')&&['POST','PUT'].includes(c.method));
test('subscription guest and terms acceptance block provider writes',async()=>{
 for(const options of [{guest:true},{terms:false}]){const r=await run('create-subscription.js',{plan:'pro'},options);assert.equal(r.status,options.guest?401:428);assert.equal(providerWrites(r).length,0);}
});
test('subscription price and owner come from server, live payer cannot be overridden',async()=>{
 const r=await run('create-subscription.js',{plan:'pro',price_cents:1,user_id:'other'},{payer:'test-buyer@example.invalid'});
 assert.equal(r.status,200);const p=JSON.parse(providerWrites(r)[0].body);assert.equal(p.auto_recurring.transaction_amount,65);assert.equal(p.payer_email,'owner@example.invalid');assert(p.external_reference.includes(uid));assert.equal(r.data.init_point,'https://checkout.example.invalid/live');
});
test('test subscription requires configured test buyer and selects sandbox checkout',async()=>{
 const missing=await run('create-subscription.js',{plan:'pro'},{test:true});assert.equal(missing.status,500);assert.equal(providerWrites(missing).length,0);
 const r=await run('create-subscription.js',{plan:'premium'},{test:true,payer:'test-buyer@example.invalid'});assert.equal(r.status,200);assert.equal(JSON.parse(providerWrites(r)[0].body).payer_email,'test-buyer@example.invalid');assert.equal(r.data.init_point,'https://checkout.example.invalid/test');
});
test('inactive subscription plan cannot start checkout',async()=>{
 const r=await run('create-subscription.js',{plan:'pro'},{inactive:true});assert.equal(r.status,409);assert.equal(providerWrites(r).length,0);
});
test('existing same plan and immediate downgrade cannot create another recurring charge',async()=>{
 for(const plan of ['pro','premium']){const r=await run('create-subscription.js',{plan:'pro'},{rows:[{status:'active',plan}]});assert.equal(r.status,409);assert.equal(providerWrites(r).length,0);}
});
test('upgrade does not cancel an active Pro before Premium approval',async()=>{
 const r=await run('create-subscription.js',{plan:'premium'},{rows:[{status:'active',plan:'pro',provider_subscription_id:'old-pro'}]});assert.equal(r.status,200);assert.equal(r.data.upgrade,true);assert.equal(providerWrites(r).filter(c=>c.method==='PUT').length,0);
});
test('admin subscription reconciliation requires verified MFA before reading subscriptions',async()=>{
 const r=await run('sync-subscriptions.js');assert.equal(r.status,403);assert(!r.calls.some(c=>c.url.includes('/user_subscriptions')));assert.equal(providerWrites(r).length,0);
});
test('verified administrator may reconcile an empty subscription set',async()=>{
 const r=await run('sync-subscriptions.js',{}, {adminMfa:true});assert.equal(r.status,200);assert.equal(r.data.checked,0);
});
test('admin reconciliation preserves paid access after end-of-cycle cancellation',async()=>{
 const r=await run('sync-subscriptions.js',{}, {adminMfa:true,mpStatus:'cancelled',rows:[{id:'row',plan:'pro',status:'active',provider_subscription_id:'fixture-sub',cancel_at_period_end:true,current_period_end:future}]});assert.equal(r.status,200);const patch=JSON.parse(r.calls.find(c=>c.method==='PATCH').body);assert.equal(patch.status,'active');assert.equal(patch.current_period_end,future);assert.equal(patch.next_payment_date,null);
});
test('owner reconciliation preserves paid access after end-of-cycle cancellation',async()=>{
 const r=await run('sync-my-subscription.js',{}, {mpStatus:'cancelled',rows:[{id:'row',plan:'pro',status:'active',provider_subscription_id:'fixture-sub',cancel_at_period_end:true,current_period_end:future}]});assert.equal(r.status,200);assert.equal(r.data.subscription.status,'active');
});
test('provider cancellation failure must not claim cancellation or write database',async()=>{
 const r=await run('cancel-subscription.js',{}, {mpFails:true,rows:[{id:'row',provider_subscription_id:'fixture-sub'}]});assert.equal(r.status,502);assert(!r.calls.some(c=>c.method==='PATCH'));
});
test('cancellation stops renewal but preserves paid period; persistence outage is reported',async()=>{
 const row={id:'row',provider_subscription_id:'fixture-sub'};
 const r=await run('cancel-subscription.js',{}, {rows:[row]});assert.equal(r.status,200);assert.equal(r.data.cancel_at_period_end,true);assert.equal(r.data.current_period_end,future);
 const outage=await run('cancel-subscription.js',{}, {rows:[row],saveFails:true});assert.equal(outage.status,503);
});
