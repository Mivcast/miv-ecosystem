// Public requests only: no session, signups, email, provider calls or billable AI.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const base=process.env.MIV_PUBLIC_BASE||'https://miv-ecosystem.vercel.app';
let requests=0;
async function check(route,status,method='GET',body){
 if(requests++)await new Promise(resolve=>setTimeout(resolve,1000));
 const response=await fetch(base+route,{method,headers:body?{'Content-Type':'application/json',Origin:base}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});
 if(response.headers.get('x-vercel-mitigated')==='challenge')throw Object.assign(Error('Verificação pública interrompida pelo desafio antiautomação da Vercel; nenhuma tentativa de contorno.'),{blocked:true});
 assert.equal(response.status,status,method+' '+route);console.log('PASS '+method+' '+route+' -> '+status);return response;
}
(async()=>{
 const config=await(await check('/api/config',200)).json();assert.deepEqual(Object.keys(config).sort(),['supabasePublishableKey','supabaseUrl']);assert.equal(config.supabaseUrl,'https://wgqdpzsqxicvaafktwnp.supabase.co');
 for(const route of ['/private/diagnosis-content.json','/private/diagnosis-service.cjs','/%70rivate/diagnosis-content.json','/private/diagnosis-content.json?action=public-config&blocked_source=0','/.env','/tests/diagnosis.integration.sql','/supabase/migrations/20261020190439_launch_privacy_security.sql'])for(const method of ['GET','HEAD'])await check(route,404,method);
 const rules=await(await check('/api/diagnoses?action=rules',200)).json();assert.equal(rules.rules.free_period,'lifetime');assert.equal(rules.rules.free_solution_limit,2);assert.equal(rules.rules.pro_mark_enabled,false);assert.equal(rules.rules.premium_mark_enabled,true);
 await check('/api/diagnoses?niche=QA',401);
 for(const [route,body] of [
  ['/api/diagnoses',{action:'unlock',niche:'QA',point_id:'base.mercado.demanda',consume_free:true}],
  ['/api/diagnoses',{action:'privacy-export'}],['/api/diagnoses',{action:'analytics-report'}],
  ['/api/create-mercadopago-preference',{item_id:'diagnosis:mercado'}],['/api/create-subscription',{plan:'pro'}],['/api/cancel-subscription',{}],['/api/manage-subscription',{action:'cancel_at_period_end'}],['/api/sync-my-subscription',{}],['/api/sync-subscriptions',{}],['/api/analysis-ai',{analysis_id:'empresa'}],['/api/calendar-ai',{}],['/api/mark-ai',{question:'QA'}]
 ])await check(route,401,'POST',body);
 const hash=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n')).digest('hex');
 for(const file of ['admin-security.js','admin.html','index.html','privacy.js','legal.html']){const response=await check('/'+file,200);const content=await response.text();assert.equal(hash(content),hash(fs.readFileSync(path.join(__dirname,'..',file),'utf8')),file+' production matches local');assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert(response.headers.get('content-security-policy')?.includes("frame-ancestors 'none'"));}
 const health=await fetch(config.supabaseUrl+'/auth/v1/health',{headers:{apikey:config.supabasePublishableKey},signal:AbortSignal.timeout(20000)});assert.equal(health.status,200);
 const settings=await fetch(config.supabaseUrl+'/auth/v1/settings',{headers:{apikey:config.supabasePublishableKey},signal:AbortSignal.timeout(20000)});assert.equal(settings.status,200);const auth=await settings.json();assert.equal(auth.external?.email,true);assert.equal(auth.mailer_autoconfirm,false);
 console.log('PASS Auth health, email signup enabled, confirmation required. Delivery not tested. No users or payments created.');
})().catch(e=>{console.error(e.blocked?'BLOCKED':'FAIL',e.message);process.exitCode=e.blocked?2:1;});
