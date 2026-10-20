const sections = require('./diagnosis-content.json');
const { validateRules } = require('../commercial-rules.js');
const points = new Map(sections.flatMap(section => section.cards.flatMap(card => card.qs.map(point => [point.id, { ...point, card_id:card.id, card_title:card.title, section_id:section.id }]))));
const cards = new Map(sections.flatMap(section => section.cards.map(card => [card.id, card])));

async function db(url, key, path, options = {}) {
  const response = await fetch(`${url}/rest/v1/${path}`, { ...options, signal:AbortSignal.timeout(15000),
    headers:{ apikey:key, 'Content-Type':'application/json', ...options.headers } });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw Object.assign(new Error('Não foi possível consultar ou salvar suas análises.'), { status:503 });
  return data;
}
async function access(url, key, userId, pointId = null, consume = false) {
  return db(url,key,'rpc/diagnosis_access',{method:'POST',body:JSON.stringify({p_user_id:userId,p_point_id:pointId,p_consume:consume})});
}
async function rules(url,key) {
  const rows = await db(url,key,'diagnosis_rules?id=eq.global&select=*&limit=1');
  return validateRules(rows?.[0]);
}
function entitled(point, grant) {
  return ['pro','premium'].includes(grant.plan) || grant.free_points.includes(point.id) || grant.paid_cards.includes(point.card_id);
}
function grantedSolutions(grant) {
  return Object.fromEntries([...points].filter(([,point])=>entitled(point,grant)).map(([id,point])=>[id,point]));
}
async function catalogItem(url,key,itemId) {
  if (!String(itemId).startsWith('diagnosis:')) return null;
  const card=cards.get(itemId.slice('diagnosis:'.length));
  if (!card) return null;
  const policy=await rules(url,key);
  return {title:'Análise · '+card.title,unit_price:policy.card_price_cents/100,amount_cents:policy.card_price_cents,item_type:'card'};
}
async function userPlan(url,key,userId) {
  const rows=await db(url,key,`user_subscriptions?user_id=eq.${encodeURIComponent(userId)}&status=eq.active&select=plan,current_period_end,created_at&order=created_at.desc`);
  return rows.find(row=>['pro','premium'].includes(row.plan)&&(!row.current_period_end||new Date(row.current_period_end)>new Date()))?.plan||'free';
}
async function markAllowed(url,key,userId) {
  const [plan,policy]=await Promise.all([userPlan(url,key,userId),rules(url,key)]);
  return plan==='premium'?policy.premium_mark_enabled:plan==='pro'?policy.pro_mark_enabled:false;
}
function validatePointData(id, data) {
  const point=points.get(id);
  if (!point || !data || typeof data!=='object' || Array.isArray(data)) throw Object.assign(new Error('Ponto de análise inválido.'),{status:400});
  const answer=data.answer===undefined?null:data.answer;
  if (![null,0,1,2,'na'].includes(answer)) throw Object.assign(new Error('Resposta inválida.'),{status:400});
  const note=typeof data.note==='string'?data.note:'';
  const naReason=typeof data.naReason==='string'?data.naReason.trim():'';
  if(note.length>5000||naReason.length>1000)throw Object.assign(new Error('Reduza o tamanho das observações.'),{status:400});
  if(answer==='na'&&(!point.allowNA||!naReason))throw Object.assign(new Error('Este ponto exige uma justificativa válida para não se aplicar.'),{status:400});
  return {answer,note,naReason:answer==='na'?naReason:''};
}
module.exports={sections,points,cards,db,access,rules,grantedSolutions,catalogItem,markAllowed,validatePointData,userPlan};
