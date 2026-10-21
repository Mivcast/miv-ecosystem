const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const catalog=require('../private/catalog-service.cjs'),niches=require('../private/niche-service.cjs'),baseline=require('../private/diagnosis-content.json');
test('edition preserves all 60 purchase and answer identifiers with valid editable content',()=>{
 const seeded=catalog.seed(),document=catalog.validate(seeded);
 assert.deepEqual([...catalog.pointMap(document).keys()],[...catalog.pointMap(baseline).keys()]);
 assert.equal(document.length,4);assert.equal(catalog.pointMap(document).size,60);
 for(const section of document)for(const card of section.cards){assert(fs.existsSync(path.join(__dirname,'..',card.img)));for(const q of card.qs){assert(q.assessment.endsWith('?'));assert(q.summary.length>20);assert(q.steps.every(s=>s.length>20));}}
});
test('public metadata omits every private solution field',()=>{
 for(const q of catalog.pointMap(catalog.publicSections(catalog.seed())).values()){assert.equal(q.standard,undefined);assert.equal(q.steps,undefined);assert.equal(q.example,undefined);}
});
test('editor rejects changed stable IDs, removed questions and unsafe images',()=>{
 let doc=catalog.seed();doc[0].cards[0].qs[0].id='forged';assert.throws(()=>catalog.validate(doc));
 doc=catalog.seed();doc[0].cards[0].qs.pop();assert.throws(()=>catalog.validate(doc));
 for(const img of ['javascript:alert(1)','data:image/svg+xml,x','assets/../private/x.jpg','http://example.com/x.png','https://user:password@example.com/x.jpg'])assert.throws(()=>catalog.image(img));
 assert.equal(catalog.image('https://example.com/image.png'),'https://example.com/image.png');
});
test('niche spelling normalization and input boundaries reject executable or personal fields',()=>{
 assert.equal(niches.normalized(' Numismática  '),'numismatica');
 for(const input of ['<img onerror=x>','https://example.com','qa@example.com','12345678901','AB','a'.repeat(101)])assert.throws(()=>niches.name(input));
});
test('AI company context uses the same saved niche, never an older company niche',async()=>{
 const old=global.fetch;try{global.fetch=async url=>{assert.match(url,/user_id=eq\.verified-user/);return {ok:true,json:async()=>[{niche:'Numismática',revision:3}]};};const company=await niches.companyContext('https://fixture.invalid','fixture','verified-user',{name:'Empresa de teste',niche:'Dentista',subniche:'Ortodontia'});assert.equal(company.name,'Empresa de teste');assert.equal(company.niche,'Numismática');assert.equal(company.subniche,'Numismática');}finally{global.fetch=old;}
});
async function run(action,{method='GET',admin=false,body={},publicRequest=false,conflict=false}={}){
 const handler=require('../api/diagnoses.js'),oldFetch=global.fetch,keys=['SUPABASE_URL','SUPABASE_SECRET_KEY','SUPABASE_PUBLISHABLE_KEY'],env=keys.map(k=>process.env[k]),calls=[];
 keys.forEach(k=>process.env[k]='fixture');let status,data;
 global.fetch=async(url,opt={})=>{calls.push({url,opt});let result;
 if(url.includes('/auth/v1/user'))result={id:'11111111-1111-4111-8111-111111111111'};
 else if(url.endsWith('/rpc/admin_access'))result=admin;
 else if(url.includes('/diagnosis_catalog?'))result=[];
 else if(url.endsWith('/rpc/publish_diagnosis_catalog'))result=conflict?{conflict:true}:{revision:2};
 else if(url.endsWith('/rpc/save_canonical_niche'))result={niche:'Numismática',revision:1,status:'approved'};
 else throw Error('Unexpected test path '+url);
 return {ok:true,json:async()=>result};};
 try{await handler({method,headers:{host:'miv-ecosystem.vercel.app',origin:'https://miv-ecosystem.vercel.app',...(publicRequest?{}:{authorization:'Bearer fixture'})},query:{action},body:{action,...body}}, {setHeader(){},status(s){status=s;return this;},json(d){data=d;},end(){}});return {status,data,calls};}
 finally{global.fetch=oldFetch;keys.forEach((k,i)=>env[i]===undefined?delete process.env[k]:process.env[k]=env[i]);}
}
test('public catalog works anonymously and does not include private fields',async()=>{const r=await run('catalog',{publicRequest:true});assert.equal(r.status,200);assert.equal(r.calls.length,1);assert(!JSON.stringify(r.data).includes('"steps"'));});
test('admin reading and publishing require stored admin/MFA access',async()=>{
 for(const [action,method] of [['catalog-admin-get','GET'],['catalog-admin-save','POST']]){const r=await run(action,{method,body:{revision:1,sections:catalog.seed()}});assert.equal(r.status,403);assert(!r.calls.some(c=>c.url.includes('diagnosis_catalog?')||c.url.includes('publish_diagnosis_catalog')));}
});
test('admin publishing validates content and reports optimistic conflicts',async()=>{
 const r=await run('catalog-admin-save',{method:'POST',admin:true,conflict:true,body:{revision:1,sections:catalog.seed()}});assert.equal(r.status,409);
 const ok=await run('catalog-admin-save',{method:'POST',admin:true,body:{revision:1,sections:catalog.seed()}});assert.equal(ok.data.revision,2);
});
test('canonical niche cannot write another user, trusted built-ins bypass suggestion review',async()=>{
 const r=await run('niche-set',{method:'POST',body:{niche:'numismatica',revision:0,user_id:'forged'}});assert.equal(r.status,200);
 const p=JSON.parse(r.calls.find(c=>c.url.includes('save_canonical_niche')).opt.body);assert.equal(p.p_user_id,'11111111-1111-4111-8111-111111111111');assert.equal(p.p_niche,'Numismática');assert.equal(p.p_known,true);
});
