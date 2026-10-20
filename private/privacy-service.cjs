const {db}=require('./diagnosis-service.cjs');
const VERSION='2026-10-20',uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const kinds=new Set(['access','correction','deletion','consent','refund','support']);
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
async function requireAdmin(url,key,user,token){if(!await require('./admin-security.cjs').allowed(url,key,user,token))fail(403,'Acesso restrito ao administrador. Confirme o segundo fator quando ativado.');}
async function requireAcceptance(url,key,user){const rows=await db(url,key,`legal_acceptances?user_id=eq.${user.id}&version=eq.${VERSION}&select=version&limit=1`);if(!rows?.length)fail(428,'Leia e aceite os Termos de Uso antes de continuar.');}
async function pages(url,key,table,filter,select='*'){
 const order=table==='diagnosis_workspaces'?'workspace_key':'id';
 const result=[];for(let offset=0;offset<10000;offset+=500){const rows=await db(url,key,`${table}?${filter}&select=${select}&order=${order}&limit=500&offset=${offset}`);if(!Array.isArray(rows))fail(503,'Não foi possível concluir a cópia.');result.push(...rows);if(rows.length<500)return result;}
 fail(413,'O volume exige uma cópia assistida. Registre uma solicitação de acesso.');
}
async function exportData(url,key,user){
 const filter=`user_id=eq.${user.id}`,result={generated_at:new Date().toISOString(),account:{id:user.id,email:user.email||null},note:'Cópia dos principais registros da conta. Outros registros e esclarecimentos podem ser solicitados pelo atendimento.'};
 for(const [name,table,select] of [
  ['favorites','user_favorites','*'],['history','user_history','*'],['progress','user_progress','*'],['reports','user_reports','*'],
  ['purchases','user_purchases','id,item_id,item_type,status,amount_cents,provider,purchased_at'],
  ['subscriptions','user_subscriptions','id,plan,status,current_period_start,current_period_end,cancel_at_period_end,next_payment_date,created_at'],
  ['diagnoses','diagnosis_workspaces','*'],['calendar','marketing_calendar_saved_ideas','*'],
  ['privacy_requests','privacy_requests','id,kind,message,status,response,created_at,updated_at'],['legal_acceptances','legal_acceptances','id,version,accepted_at']
 ])result[name]=await pages(url,key,table,filter,select);
 result.profile=await db(url,key,`profiles?id=eq.${user.id}&select=id,full_name,phone,avatar_url,created_at,updated_at`);
 const memberships=await db(url,key,`company_users?${filter}&select=company_id`);
 result.companies=[];
 for(const row of memberships){if(!uuid.test(row.company_id))continue;result.companies.push({company:await db(url,key,`companies?id=eq.${row.company_id}&select=*`),profile:await db(url,key,`company_profiles?company_id=eq.${row.company_id}&select=*`)});}
 return result;
}
async function handle(url,key,user,input,token){
 if(!uuid.test(user.id))fail(401,'Sessão inválida.');
 if(input.action==='legal-status')return {version:VERSION,accepted:(await db(url,key,`legal_acceptances?user_id=eq.${user.id}&version=eq.${VERSION}&select=id&limit=1`)).length>0};
 if(input.action==='legal-accept'){
  if(input.accepted!==true||input.version!==VERSION)fail(400,'Confirme o aceite da versão apresentada.');
  await db(url,key,'legal_acceptances?on_conflict=user_id,version',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates'},body:JSON.stringify({user_id:user.id,version:VERSION})});return {accepted:true,version:VERSION};
 }
 if(input.action==='privacy-export')return exportData(url,key,user);
 if(input.action==='privacy-list')return {requests:await db(url,key,`privacy_requests?user_id=eq.${user.id}&select=id,kind,message,status,response,created_at,updated_at&order=created_at.desc&limit=100`)};
 if(input.action==='privacy-request'){
  const message=String(input.message||'').trim();if(!kinds.has(input.kind)||message.length<10||message.length>2000)fail(400,'Escolha um motivo e descreva o pedido entre 10 e 2.000 caracteres.');
  if(!uuid.test(input.request_id||''))fail(400,'Protocolo inválido.');
  const result=await db(url,key,'rpc/privacy_create_request',{method:'POST',body:JSON.stringify({p_user_id:user.id,p_id:input.request_id,p_email:String(user.email||'').slice(0,254),p_kind:input.kind,p_message:message})});return {request:result};
 }
 await requireAdmin(url,key,user,token);
 if(input.action==='privacy-admin-list')return {requests:await db(url,key,'privacy_requests?select=id,user_id,contact_email,kind,message,status,response,created_at,updated_at&order=created_at.desc&limit=200')};
 if(input.action==='privacy-admin-update'){
  if(!uuid.test(input.request_id||'')||!['received','in_progress','completed'].includes(input.status))fail(400,'Pedido ou situação inválida.');
  const response=String(input.response||'').trim();if(response.length>3000||input.status==='completed'&&response.length<10)fail(400,'Informe uma resposta de conclusão entre 10 e 3.000 caracteres.');
  const result=await db(url,key,'rpc/privacy_update_request',{method:'POST',body:JSON.stringify({p_id:input.request_id,p_admin_id:user.id,p_status:input.status,p_response:response})});return {request:result};
 }
 fail(400,'Ação inválida.');
}
module.exports={VERSION,kinds,handle,requireAdmin,requireAcceptance,exportData};
