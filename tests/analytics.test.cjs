const test=require('node:test');
const assert=require('node:assert/strict');
const service=require('../private/analytics-service.cjs');
const handler=require('../api/diagnoses.js');
const uid='11111111-1111-4111-8111-111111111111';
const event={event_id:uid,visitor_id:uid,session_id:uid,name:'card_click',page:'home',item_id:'whatsapp',niche:'Médico',source:'instagram',campaign:'outubro',device:'mobile'};
test('events strip client identity, plan, free text and timestamps',()=>{
 const [value]=service.validateEvents({consent:true,events:[{...event,user_id:uid,plan:'premium',text:'secret',note:'private',occurred_at:'2000-01-01'}]});
 assert.deepEqual(value,event);assert.equal(value.text,undefined);assert.equal(value.plan,undefined);
});
test('consent, batch size, allowed names and session boundaries are mandatory',()=>{
 for(const body of [{events:[event]},{consent:true,events:[]},{consent:true,events:Array(21).fill(event)},{consent:true,events:[{...event,name:'payment_approved'}]},{consent:true,events:[event,{...event,session_id:'22222222-2222-4222-8222-222222222222'}]}])assert.throws(()=>service.validateEvents(body),e=>e.status===400);
});
test('checkout attribution requires explicit consent and strips unknown fields',()=>{
 assert.deepEqual(service.context({consent:false,source:'instagram'}),{source:'unknown',campaign:'',device:'unknown',niche:''});
 assert.equal(service.context({...event,consent:true,ip:'192.0.2.1',answer:'secret'}).ip,undefined);
});
test('report dates are inclusive Sao Paulo days, bounded and calendar-valid',()=>{
 const input=service.reportInput({from:'2026-10-01',to:'2026-10-31'});assert.equal(input.p_from,'2026-10-01T03:00:00.000Z');assert.equal(input.p_to,'2026-11-01T03:00:00.000Z');
 for(const q of [{from:'2026-99-01',to:'2026-10-02'},{from:'2026-02-30',to:'2026-03-03'},{from:'2026-10-03',to:'2026-10-01'},{from:'2024-01-01',to:'2026-01-01'},{from:'2026-10-01',to:'2026-10-01',plan:'admin'}])assert.throws(()=>service.reportInput(q),e=>e.status===400);
});
const payment={id:123,transaction_amount:19.90,currency_id:'BRL',status:'approved',date_created:'2026-10-01T12:00:00Z',date_approved:'2026-10-01T12:01:00Z',date_last_updated:'2026-10-01T12:02:00Z',live_mode:true};
test('payment ledger distinguishes sandbox and real, partial/full refunds and no-client amounts',()=>{
 const identity={userId:uid,itemId:'diagnosis:mercado',orderId:uid};
 assert.equal(service.paymentRow(payment,identity).amount_cents,1990);
 assert.equal(service.paymentRow({...payment,live_mode:false},identity).environment,'test');
 assert.equal(service.paymentRow({...payment,transaction_amount_refunded:2},identity).refunded_cents,200);
 assert.equal(service.paymentRow({...payment,status:'charged_back'},identity).refunded_cents,1990);
 assert.equal(service.paymentRow({...payment,currency_id:'USD'},identity),null);
 assert.equal(service.paymentRow({...payment,transaction_amount:-1},identity),null);
 assert.equal(service.paymentRow(payment,{...identity,userId:'not-a-user'}),null);
});
test('different origin is denied and same-origin is accepted',()=>{
 assert.equal(service.sameOrigin({headers:{host:'example.com',origin:'https://attacker.invalid'}}),false);
 assert.equal(service.sameOrigin({headers:{host:'example.com',origin:'https://example.com'}}),true);
});
async function run(request,role='user'){
 const old=global.fetch,env={SUPABASE_URL:process.env.SUPABASE_URL,SUPABASE_SECRET_KEY:process.env.SUPABASE_SECRET_KEY,SUPABASE_PUBLISHABLE_KEY:process.env.SUPABASE_PUBLISHABLE_KEY};Object.keys(env).forEach(k=>process.env[k]='test');
 const calls=[];global.fetch=async(url,options={})=>{calls.push({url,options});const data=url.includes('/auth/v1/user')?{id:uid}:url.includes('profiles?')?[{role}]:url.includes('analytics_report')?{summary:{sales:3}}:1;return {ok:true,status:200,json:async()=>data};};
 let status=200,data;const res={setHeader(){},status(s){status=s;return this},json(value){data=value;},end(){}};
 try{await handler({headers:{},...request},res);return {status,data,calls};}finally{global.fetch=old;Object.keys(env).forEach(k=>env[k]===undefined?delete process.env[k]:process.env[k]=env[k]);}
}
test('admin report requires a verified session and stored administrator role',async()=>{
 const query={action:'analytics-report',from:'2026-10-01',to:'2026-10-20'};
 assert.equal((await run({method:'GET',query})).status,401);
 const denied=await run({method:'GET',query,headers:{authorization:'Bearer user'}});assert.equal(denied.status,403);assert(!denied.calls.some(c=>c.url.endsWith('/rpc/analytics_report')));
 const allowed=await run({method:'GET',query,headers:{authorization:'Bearer admin'}},'admin');assert.equal(allowed.status,200);assert.equal(allowed.data.summary.sales,3);
});
test('anonymous ingest never trusts client user or plan and disallows forged financial events',async()=>{
 const result=await run({method:'POST',body:{action:'analytics-events',consent:true,events:[{...event,user_id:uid,plan:'premium'}]}});
 assert.equal(result.status,200);const body=JSON.parse(result.calls[0].options.body);assert.equal(body.p_user_id,null);assert.equal(body.p_events[0].plan,undefined);
 const forged=await run({method:'POST',body:{action:'analytics-events',consent:true,events:[{...event,name:'payment_approved'}]}});assert.equal(forged.status,400);assert.equal(forged.calls.length,0);
});
test('analytics storage failures cannot prevent checkout/access fulfillment',async()=>{
 const old=global.fetch;global.fetch=async()=>{throw new Error('offline')};try{assert.equal(await service.order('url','key',{id:uid,userId:uid,providerRef:'ref',itemId:'whatsapp',kind:'single',amountCents:1990}),null);}finally{global.fetch=old;}
});
test('single checkout plan is read from the database, not supplied attribution',async()=>{
 const old=global.fetch;let row;
 global.fetch=async(url,options={})=>({ok:true,json:async()=>{if(url.includes('user_subscriptions'))return [{plan:'pro',current_period_end:'2099-01-01'}];row=JSON.parse(options.body);return null;}});
 try{await service.order('url','key',{id:uid,userId:uid,providerRef:'ref',itemId:'whatsapp',kind:'single',amountCents:1990,attribution:{...event,consent:true,plan:'premium'}});assert.equal(row.plan,'pro');assert.equal(row.amount_cents,1990);}finally{global.fetch=old;}
});
test('financial journal reports write failures for webhook retries',async()=>{
 const old=global.fetch;global.fetch=async()=>{throw new Error('offline')};
 try{assert.deepEqual(await service.payment('url','key',payment,{userId:uid,itemId:'whatsapp'}),{applicable:true,recorded:false});}finally{global.fetch=old;}
});
