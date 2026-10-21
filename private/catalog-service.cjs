const edition=require('../diagnosis-edition.js');
const baseline=require('./diagnosis-content.json');
const updates=require('./diagnosis-updates.cjs');
const {db}=require('./diagnosis-service.cjs');
const fail=(status,message)=>{throw Object.assign(Error(message),{status});};
const images=['market','product','people','price','business','brand','value','design','offer','presence','attract','content','service','sales','retain','metrics','bottleneck','growth','expand','innovation'];
function seed(){return baseline.map((section,si)=>{
 const edit=edition.sections[si];
 return {...section,title:edit.title,desc:edit.subtitle,intro:edit.intro,kicker:'Etapa '+(si+1),cards:section.cards.map((card,ci)=>{
  const patch=edit.cards[ci],image=images[si*5+ci];
  return {...card,desc:patch.desc,img:image==='service'?'assets/cards/whatsapp.jpg':'assets/evolution/'+image+'.jpg',impact:[],qs:card.qs.map((q,qi)=>{
   const [text,summary,assessment,keywords]=patch.qs[qi],guide=updates[card.id+':'+qi];
   return {...q,text,summary,assessment,keywords,standard:guide?.[0]||q.standard,steps:guide?.[1]||q.steps,example:guide?.[2]||q.example};
  })};
 })};
});}
function safeText(value,max,required=true){if(typeof value!=='string'||value.length>max||required&&!value.trim())fail(400,'Preencha os textos dentro dos limites indicados.');return value.trim();}
function image(value){const s=safeText(value,1500);if(/^assets\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp|avif)$/i.test(s)&&!s.includes('..'))return s;try{const u=new URL(s);if(u.protocol==='https:'&&!u.username&&!u.password)return u.href;}catch{}fail(400,'Use uma imagem local em assets ou um endereço HTTPS sem credenciais.');}
function validate(document){
 if(!Array.isArray(document)||document.length!==4)fail(400,'Mantenha as quatro etapas e seus identificadores.');
 return document.map((s,si)=>{
  const expected=baseline[si];if(s.id!==expected.id||!Array.isArray(s.cards)||s.cards.length!==5)fail(400,'Não altere IDs, ordem ou quantidade dos cards.');
  return {id:s.id,title:safeText(s.title,150),desc:safeText(s.desc,600),intro:safeText(s.intro||'',1600,false),kicker:'Etapa '+(si+1),cards:s.cards.map((c,ci)=>{
   const old=expected.cards[ci];if(c.id!==old.id||!Array.isArray(c.qs)||c.qs.length!==3)fail(400,'Mantenha os três pontos e seus identificadores em cada card.');
   return {id:c.id,title:safeText(c.title,150),desc:safeText(c.desc,600),img:image(c.img),impact:Array.isArray(c.impact)?c.impact.slice(0,4).map(t=>safeText(t,50)):[],qs:c.qs.map((q,qi)=>{
    const prior=old.qs[qi];if(q.id!==prior.id)fail(400,'Os IDs preservam respostas e compras e não podem mudar.');
    if(!Array.isArray(q.steps)||q.steps.length<1||q.steps.length>8)fail(400,'Informe entre um e oito passos de solução.');
    return {id:q.id,text:safeText(q.text,300),summary:safeText(q.summary,700),assessment:safeText(q.assessment,400),keywords:safeText(q.keywords||'',500,false),why:safeText(q.why,1000),standard:safeText(q.standard,1600),steps:q.steps.map(t=>safeText(t,1500)),example:safeText(q.example,2000),resources:prior.resources,allowNA:prior.allowNA,legacyKey:prior.legacyKey,legacyInvert:prior.legacyInvert};
   })};
  })};
 });
}
function publicSections(sections){return sections.map(s=>({...s,cards:s.cards.map(c=>({...c,qs:c.qs.map(({standard,steps,example,...q})=>q)}))}));}
function pointMap(sections){return new Map(sections.flatMap(s=>s.cards.flatMap(c=>c.qs.map(q=>[q.id,{...q,card_id:c.id,card_title:c.title,section_id:s.id}]))));}
async function load(url,key){const rows=await db(url,key,'diagnosis_catalog?id=eq.global&select=revision,document&limit=1');const row=rows?.[0];return {revision:row?.revision||1,sections:row?.document?validate(row.document):seed()};}
async function publish(url,key,user,token,input){
 await require('./privacy-service.cjs').requireAdmin(url,key,user,token);
 if(!Number.isSafeInteger(input.revision)||input.revision<1)fail(400,'Revisão inválida. Recarregue o editor.');
 const document=validate(input.sections);
 const result=await db(url,key,'rpc/publish_diagnosis_catalog',{method:'POST',body:JSON.stringify({p_revision:input.revision,p_document:document,p_actor:user.id})});
 if(result?.conflict)fail(409,'Outra edição foi publicada. Recarregue antes de salvar para não sobrescrevê-la.');
 return {revision:result.revision,sections:document};
}
module.exports={seed,validate,image,publicSections,pointMap,load,publish};
