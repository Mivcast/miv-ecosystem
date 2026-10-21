const assert=require('node:assert/strict');
const base=process.env.MIV_QA_URL||'https://miv-ecosystem.vercel.app';
async function get(path,status=200){const r=await fetch(base+path,{signal:AbortSignal.timeout(20000),cache:'no-store'});assert.equal(r.status,status,path);return r;}
(async()=>{
 const catalog=await (await get('/api/diagnoses?action=catalog')).json();assert.equal(catalog.sections.length,4);const qs=catalog.sections.flatMap(s=>s.cards.flatMap(c=>c.qs));assert.equal(qs.length,60);for(const q of qs){assert(q.assessment);for(const key of ['steps','standard','example'])assert.equal(q[key],undefined);}
 assert.equal(qs[0].text,'Seu mercado é bom para investir e crescer?');
 const code=await (await get('/evolution.js?v=13')).text();assert(code.includes("2:'Ok'"));assert(code.includes("1:'Mediano'"));assert(code.includes("0:'Ruim'"));assert(code.includes('Como seu negócio está nesse ponto?'));
 assert((await (await get('/index.html')).text()).includes('niche-profile.js'));
 assert((await (await get('/admin.html')).text()).includes('admin-catalog.js'));
 const niches=await (await get('/api/diagnoses?action=niches')).json();assert(niches.niches.some(n=>n.name==='Numismática'));
 for(const path of ['/private/catalog-service.cjs','/private/diagnosis-updates.cjs','/private/niche-service.cjs','/tests/catalog.test.cjs','/supabase/migrations/20261021090000_editable_diagnosis_niches.sql'])await get(path,404);
 for(const action of ['catalog-admin-get','niche-get','niche-admin-list'])await get('/api/diagnoses?action='+action,401);
 for(const file of ['catalog.css','catalog-client.js','question-finder.js','niche-catalog.js','niche-profile.js','diagnosis-edition.js','admin-catalog.js'])await get('/'+file);
 console.log('PASS hosted: 60 public questions, new assessment labels, canonical niche catalog, Admin assets, private sources blocked and authenticated routes denied. Read-only; no quota or payments.');
})().catch(e=>{console.error(e);process.exitCode=1;});
