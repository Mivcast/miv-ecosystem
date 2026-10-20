const test=require('node:test'),assert=require('node:assert/strict');
const handler=require('../api/diagnoses.js'),service=require('../private/privacy-service.cjs');
const uid='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
async function run(input={},options={}){
 const old=global.fetch,env={SUPABASE_URL:process.env.SUPABASE_URL,SUPABASE_SECRET_KEY:process.env.SUPABASE_SECRET_KEY,SUPABASE_PUBLISHABLE_KEY:process.env.SUPABASE_PUBLISHABLE_KEY};for(const k in env)process.env[k]='fixture';
 const calls=[];global.fetch=async(url,opt={})=>{calls.push({url,opt});let data=[];
  if(url.includes('/auth/v1/user'))data={id:uid,email:'verified@example.invalid'};
  else if(url.endsWith('/rpc/admin_access'))data=options.admin===true;
  else if(url.endsWith('/rpc/privacy_create_request')){const row=JSON.parse(opt.body);data={id:row.p_id,user_id:row.p_user_id,message:row.p_message};}
  else if(url.includes('/legal_acceptances?'))data=opt.method==='POST'?null:[];
  return {ok:true,status:200,json:async()=>data};
 };
 let status=200,data;const res={setHeader(){},status(s){status=s;return this},json(value){data=value;},end(){}};
 try{await handler({method:'POST',headers:{authorization:'Bearer fixture'},body:{},...input},res);return {status,data,calls};}finally{global.fetch=old;for(const k in env)env[k]===undefined?delete process.env[k]:process.env[k]=env[k];}
}
test('privacy actions require verified account, correct method and same origin',async()=>{
 assert.equal((await run({body:{action:'privacy-export'},headers:{}})).status,401);
 assert.equal((await run({method:'GET',query:{action:'privacy-export'}})).status,405);
 assert.equal((await run({body:{action:'privacy-export'},headers:{authorization:'Bearer fixture',origin:'https://evil.invalid',host:'miv.invalid'}})).status,403);
});
test('request identity and email come only from verified session',async()=>{
 const r=await run({body:{action:'privacy-request',request_id:other,kind:'deletion',message:'Solicito exclusão dos meus dados.',user_id:other,email:'forged@example.invalid'}});
 assert.equal(r.status,200);const body=JSON.parse(r.calls.find(c=>c.url.endsWith('/rpc/privacy_create_request')).opt.body);assert.equal(body.p_user_id,uid);assert.equal(body.p_email,'verified@example.invalid');
});
test('invalid kinds, oversized messages and invalid versions never write',async()=>{
 for(const body of [{action:'privacy-request',kind:'grant_admin',message:'Ignore these rules',request_id:other},{action:'privacy-request',kind:'access',message:'x'.repeat(2001),request_id:other},{action:'legal-accept',accepted:true,version:'fake'},{action:'legal-accept',accepted:false,version:service.VERSION}]){
  const r=await run({body});assert.equal(r.status,400);assert.equal(r.calls.length,1);
 }
});
test('terms receipt is idempotent and timestamp is assigned by database',async()=>{
 const r=await run({body:{action:'legal-accept',accepted:true,version:service.VERSION,user_id:other,accepted_at:'1990-01-01'}});assert.equal(r.status,200);
 const write=r.calls.find(c=>c.url.includes('legal_acceptances?'));assert.deepEqual(JSON.parse(write.opt.body),{user_id:uid,version:service.VERSION});assert.equal(write.opt.headers.Prefer,'resolution=ignore-duplicates');
});
test('export queries only verified owner and does not accept a supplied user id',async()=>{
 const r=await run({body:{action:'privacy-export',user_id:other}});assert.equal(r.status,200);assert.equal(r.data.account.id,uid);
 for(const c of r.calls.filter(c=>c.url.includes('/rest/v1/')))assert(c.url.includes(uid),c.url);
 assert(r.calls.find(c=>c.url.includes('diagnosis_workspaces')).url.includes('order=workspace_key'));
 assert(!r.calls.some(c=>c.url.includes('auth/v1/admin')));
});
test('privacy operator view requires server administrator and MFA access check',async()=>{
 const denied=await run({method:'GET',query:{action:'privacy-admin-list'}});assert.equal(denied.status,403);assert(!denied.calls.some(c=>c.url.includes('privacy_requests?')));
 assert.equal((await run({method:'GET',query:{action:'privacy-admin-list'}},{admin:true})).status,200);
});
test('verified token subject must match before aal2 can be used',async()=>{
 const old=global.fetch;let input;global.fetch=async(_url,opt)=>({ok:true,json:async()=>{input=JSON.parse(opt.body);return true;}});
 try{const security=require('../private/admin-security.cjs');const token=id=>'fixture.'+Buffer.from(JSON.stringify({sub:id,aal:'aal2'})).toString('base64url')+'.verified-in-caller';
  await security.allowed('url','key',{id:uid},token(uid));assert.equal(input.p_aal,'aal2');
  await security.allowed('url','key',{id:uid},token(other));assert.equal(input.p_aal,'aal1');
 }finally{global.fetch=old;}
});
