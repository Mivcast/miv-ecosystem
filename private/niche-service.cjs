const {db}=require('./diagnosis-service.cjs');
const builtins=require('../niche-catalog.js').flatMap(g=>[g.name,...g.subs]);
const fail=(status,message)=>{throw Object.assign(Error(message),{status});};
function name(value){const n=String(value||'').normalize('NFC').trim().replace(/\s+/g,' ');if(n.length<3||n.length>100||!/^\p{L}[\p{L}\p{N} '&()./-]*$/u.test(n)||/https?:|www\.|\d{7}/i.test(n))fail(400,'Informe apenas o nome da sua atividade, sem links ou dados pessoais.');return n;}
const normalized=value=>name(value).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
async function approved(url,key){return db(url,key,'niche_suggestions?status=eq.approved&select=name,normalized,category,theme&order=name&limit=500');}
async function profile(url,key,user){return (await db(url,key,`user_niche_profiles?user_id=eq.${user.id}&select=niche,revision&limit=1`))[0]||{niche:null,revision:0};}
async function save(url,key,user,input){
 const requested=name(input.niche),known=builtins.find(n=>normalized(n)===normalized(requested)),niche=known||requested;if(!Number.isSafeInteger(input.revision)||input.revision<0)fail(400,'Recarregue seu perfil de nicho antes de salvar.');
 const result=await db(url,key,'rpc/save_canonical_niche',{method:'POST',body:JSON.stringify({p_user_id:user.id,p_niche:niche,p_normalized:normalized(niche),p_revision:input.revision,p_known:!!known})});
 if(result.conflict)fail(409,'Seu nicho mudou em outra sessão. Recarregue e confirme a escolha.');
 if(result.rejected)fail(400,'Esse nome precisa ser revisto. Informe sua atividade profissional.');
 if(result.limited)fail(429,'Limite de novos nichos atingido. Tente novamente amanhã.');
 return result;
}
async function admin(url,key,user,token,input){
 await require('./privacy-service.cjs').requireAdmin(url,key,user,token);
 if(input.action==='niche-admin-list')return {suggestions:await db(url,key,'niche_suggestions?select=id,name,category,theme,status,created_at&order=created_at.desc&limit=200')};
 if(!/^[a-f0-9-]{36}$/i.test(input.id||'')||!['approved','rejected','pending'].includes(input.status))fail(400,'Sugestão inválida.');
 const themes=['clean','medical','health','fitness','agency','retail','food','beauty','legal','construction','auto'];
 if(!themes.includes(input.theme))fail(400,'Tema inválido.');
 const category=name(input.category),canonical=name(input.name);
 const rows=await db(url,key,`niche_suggestions?id=eq.${input.id}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({name:canonical,normalized:normalized(canonical),category,theme:input.theme,status:input.status,updated_at:new Date().toISOString()})});
 return {suggestion:rows?.[0]};
}
async function companyContext(url,key,userId,company){const chosen=await profile(url,key,{id:userId});return chosen.niche?{...company,niche:chosen.niche,subniche:chosen.niche}:company;}
module.exports={name,normalized,approved,profile,save,admin,companyContext};
