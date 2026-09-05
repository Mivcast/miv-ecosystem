function send(res,s,b){return res.status(s).json(b)}
async function userFromJwt(url,pub,jwt){const r=await fetch(`${url}/auth/v1/user`,{headers:{apikey:pub,Authorization:`Bearer ${jwt}`}});return r.ok?r.json():null}
async function sb(url,key,path,opts={}){const r=await fetch(`${url}/rest/v1/${path}`,{...opts,headers:{apikey:key,'Content-Type':'application/json',Prefer:opts.prefer||'',...(opts.headers||{})}});const t=await r.text();let d=null;try{d=t?JSON.parse(t):null}catch{d=t}if(!r.ok)throw new Error(`Supabase ${r.status}: ${typeof d==='string'?d:JSON.stringify(d)}`);return d}
const DEFAULT_SUBSCRIPTION_PLANS={
 pro:{price_cents:4790,currency_id:'BRL'},
 premium:{price_cents:9790,currency_id:'BRL'}
};
function normalizePlan(row,planKey){
 const base=DEFAULT_SUBSCRIPTION_PLANS[planKey];
 return {...base,...(row||{}),price_cents:Number(row?.price_cents)>0?Number(row.price_cents):base.price_cents,currency_id:row?.currency_id||base.currency_id};
}
module.exports=async function(req,res){
 if(req.method!=='POST')return send(res,405,{error:'Método não permitido.'});
 try{
  const su=process.env.SUPABASE_URL,pk=process.env.SUPABASE_PUBLISHABLE_KEY,sk=process.env.SUPABASE_SECRET_KEY,mp=process.env.MERCADOPAGO_ACCESS_TOKEN;
  if(!su||!pk||!sk||!mp)return send(res,500,{error:'Servidor não configurado.'});
  const jwt=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');const user=await userFromJwt(su,pk,jwt);if(!user?.id)return send(res,401,{error:'Sessão inválida.'});
  const action=String(req.body?.action||'').trim();
  const rows=await sb(su,sk,`user_subscriptions?user_id=eq.${encodeURIComponent(user.id)}&provider=eq.mercadopago&provider_subscription_id=not.is.null&status=eq.active&select=*&order=created_at.desc&limit=1`);
  const row=rows?.[0];if(!row)return send(res,404,{error:'Assinatura ativa não encontrada.'});
  const sid=String(row.provider_subscription_id||'');
  const mr=await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(sid)}`,{headers:{Authorization:`Bearer ${mp}`}});const current=await mr.json().catch(()=>({}));if(!mr.ok)return send(res,502,{error:'Não foi possível consultar a assinatura no Mercado Pago.'});
  const next=current.next_payment_date||row.next_payment_date||row.current_period_end||null;
  if(action==='cancel_at_period_end'){
   const r=await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(sid)}`,{method:'PUT',headers:{Authorization:`Bearer ${mp}`,'Content-Type':'application/json'},body:JSON.stringify({status:'cancelled'})});const d=await r.json().catch(()=>({}));if(!r.ok)return send(res,502,{error:d?.message||'Não foi possível cancelar a renovação.'});
   const patch={status:'active',cancel_at_period_end:true,current_period_end:next,next_payment_date:null,scheduled_plan:null,scheduled_change_at:null,updated_at:new Date().toISOString()};
   await sb(su,sk,`user_subscriptions?id=eq.${encodeURIComponent(row.id)}`,{method:'PATCH',prefer:'return=representation',body:JSON.stringify(patch)});
   return send(res,200,{ok:true,action,status:'active',cancel_at_period_end:true,current_period_end:next});
  }
  if(action==='schedule_downgrade'){
   if(row.plan!=='premium')return send(res,409,{error:'O downgrade só pode ser programado a partir do Premium.'});
   if(!next)return send(res,409,{error:'Não foi possível identificar a próxima cobrança desta assinatura.'});
   const plans=await sb(su,sk,'subscription_plans?plan_key=eq.pro&active=eq.true&select=*&limit=1');const pro=normalizePlan(plans?.[0],'pro');
   const r=await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(sid)}`,{method:'PUT',headers:{Authorization:`Bearer ${mp}`,'Content-Type':'application/json'},body:JSON.stringify({auto_recurring:{transaction_amount:Number(pro.price_cents)/100,currency_id:pro.currency_id||'BRL'}})});const d=await r.json().catch(()=>({}));if(!r.ok)return send(res,502,{error:d?.message||'Não foi possível programar o downgrade no Mercado Pago.'});
   await sb(su,sk,`user_subscriptions?id=eq.${encodeURIComponent(row.id)}`,{method:'PATCH',prefer:'return=representation',body:JSON.stringify({scheduled_plan:'pro',scheduled_change_at:next,updated_at:new Date().toISOString()})});
   return send(res,200,{ok:true,action,scheduled_plan:'pro',scheduled_change_at:next});
  }
  if(action==='undo_downgrade'){
   if(row.scheduled_plan!=='pro')return send(res,409,{error:'Não existe downgrade programado.'});
   const plans=await sb(su,sk,'subscription_plans?plan_key=eq.premium&active=eq.true&select=*&limit=1');const premium=normalizePlan(plans?.[0],'premium');
   const r=await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(sid)}`,{method:'PUT',headers:{Authorization:`Bearer ${mp}`,'Content-Type':'application/json'},body:JSON.stringify({auto_recurring:{transaction_amount:Number(premium.price_cents)/100,currency_id:premium.currency_id||'BRL'}})});const d=await r.json().catch(()=>({}));if(!r.ok)return send(res,502,{error:d?.message||'Não foi possível manter o Premium.'});
   await sb(su,sk,`user_subscriptions?id=eq.${encodeURIComponent(row.id)}`,{method:'PATCH',prefer:'return=representation',body:JSON.stringify({scheduled_plan:null,scheduled_change_at:null,updated_at:new Date().toISOString()})});
   return send(res,200,{ok:true,action,scheduled_plan:null});
  }
  return send(res,400,{error:'Ação inválida.'});
 }catch(e){console.error('[MIV manage subscription]',e);return send(res,500,{error:'Não foi possível gerenciar a assinatura agora.'})}
}
