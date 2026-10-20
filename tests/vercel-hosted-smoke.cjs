const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const assert=require('node:assert/strict');

const deployment=process.env.MIV_QA_DEPLOYMENT||'https://miv-ecosystem-git-release-diagnosis-rules-2026-10-19-mivcast.vercel.app';
const scope='team_ygqcxwuQImHvtu1vaxTLs9Cz';
const binDirs=process.env.PATH.split(path.delimiter);
const packagePath=binDirs.map(dir=>path.resolve(dir,'..','vercel','package.json')).find(file=>fs.existsSync(file));
if(!packagePath&&!process.env.MIV_VERCEL_CLI)throw new Error('Run with npm exec --package=vercel@64.5.0 -- node tests/vercel-hosted-smoke.cjs');
const pkg=packagePath?JSON.parse(fs.readFileSync(packagePath,'utf8')):null;
const cli=process.env.MIV_VERCEL_CLI||path.resolve(path.dirname(packagePath),typeof pkg.bin==='string'?pkg.bin:pkg.bin.vercel);
function request(route,method='GET',body){
 const args=[cli,'curl',route,'--deployment',deployment,'--scope',scope,'--','--silent','--show-error','--max-time','30','--write-out','\n__MIV_STATUS__:%{http_code}'];
 if(method==='HEAD')args.push('--head');else args.push('--request',method);
 if(body)args.push('--header','Content-Type: application/json','--data',JSON.stringify(body));
 const raw=execFileSync(process.execPath,args,{encoding:'utf8',timeout:60000,maxBuffer:4000000,stdio:['ignore','pipe','pipe']});
 const marker=raw.lastIndexOf('\n__MIV_STATUS__:');
 if(marker<0)throw new Error('Missing HTTP status for '+route);
 return{status:Number(raw.slice(marker+16).trim()),text:raw.slice(0,marker)};
}
function check(route,status,method,body){
 const result=request(route,method,body);
 assert.equal(result.status,status,'Unexpected HTTP status for '+route);
 console.log('PASS '+(method||'GET')+' '+route+' -> '+status);
 return result;
}
(async()=>{
 const config=JSON.parse(check('/api/config',200).text);
 assert.deepEqual(Object.keys(config).sort(),['supabasePublishableKey','supabaseUrl']);
 assert.equal(config.supabaseUrl,'https://wgqdpzsqxicvaafktwnp.supabase.co');
 assert(config.supabasePublishableKey);
 for(const route of ['/private','/private/','/private/diagnosis-content.json','/private/diagnosis-service.cjs','/%70rivate/diagnosis-content.json','/private/diagnosis-content.json?action=public-config&blocked_source=0']){
  for(const method of ['GET','HEAD']){
   const denied=check(route,404,method);
   assert(!denied.text.includes('"steps"'),'Private content returned in error body');
   assert(!denied.text.includes('module.exports'),'Private source returned in error body');
  }
 }
 const rules=JSON.parse(check('/api/diagnoses?action=rules',200).text).rules;
 assert.equal(rules.free_solution_limit,2);assert.equal(rules.card_price_cents,1990);
 assert.equal(rules.pro_mark_enabled,false);assert.equal(rules.premium_mark_enabled,true);
 check('/api/diagnoses?niche=QA',401);
 check('/api/diagnoses',401,'POST',{action:'unlock',niche:'QA',point_id:'base.mercado.demanda',consume_free:true});
 check('/api/create-mercadopago-preference',401,'POST',{item_id:'diagnosis:mercado'});
 check('/api/analysis-ai',401,'POST',{analysis_id:'empresa'});
 check('/api/mark-ai',401,'POST',{question:'QA',context:{diagnosis_point_id:'base.mercado.demanda'}});
 assert(check('/',200).text.includes('MIV Ecosystem'));
 const metadata=check('/diagnosis-guidance.js',200).text;
 assert(!/"steps"\s*:/.test(metadata),'Private solution steps exposed in metadata');
 const health=await fetch(config.supabaseUrl+'/auth/v1/health',{headers:{apikey:config.supabasePublishableKey},signal:AbortSignal.timeout(15000)});
 assert.equal(health.status,200);console.log('PASS Supabase Auth health -> 200');
 console.log('Hosted read-only smoke completed. No account created, quota consumed or payment requested.');
})().catch(error=>{console.error('FAIL '+error.message);process.exitCode=1;});
