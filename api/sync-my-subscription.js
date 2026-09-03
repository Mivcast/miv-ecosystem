function send(res,s,b){return res.status(s).json(b)}
async function userFromJwt(url,pub,jwt){const r=await fetch(`${url}/auth/v1/user`,{headers:{apikey:pub,Authorization:`Bearer ${jwt}`}});if(!r.ok)return null;return r.json()}
async function sbFetch(url,key,path,opts={}){const r=await fetch(`${url}/rest/v1/${path}`,{...opts,headers:{apikey:key,'Content-Type':'application/json',Prefer:opts.prefer||'',...(opts.headers||{})}});const t=await r.text();let d=null;try{d=t?JSON.parse(t):null}catch{d=t}if(!r.ok)throw new Error(`Supabase ${r.status}: ${typeof d==='string'?d:JSON.stringify(d)}`);return d}
module.exports=async function(req,res){
 if(req.method!=='POST')return send(res,405,{error:'Método não permitido.'});
 try{
  const su=process.env.SUPABASE_URL,pk=process.env.SUPABASE_PUBLISHABLE_KEY,sk=process.env.SUPABASE_SECRET_KEY,mp=process.env.MERCADOPAGO_ACCESS_TOKEN;
  if(!su||!pk||!sk||!mp)return send(res,500,{error:'Servidor não configurado.'});
  const jwt=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  const user=await userFromJwt(su,pk,jwt);if(!user?.id)return send(res,401,{error:'Sessão inválida.'});
  const subs=await sbFetch(su,sk,`user_subscriptions?user_id=eq.${encodeURIComponent(user.id)}&provider=eq.mercadopago&provider_subscription_id=not.is.null&status=in.(pending,active,past_due)&select=*&order=created_at.desc&limit=5`);
  let checked=0,updated=0;let best=null;
  for(const row of (subs||[])){
   const sid=String(row.provider_subscription_id||'').trim();if(!sid)continue;checked++;
   const r=await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(sid)}`,{headers:{Authorization:`Bearer ${mp}`}});
   const sub=await r.json().catch(()=>({}));if(!r.ok)continue;
   const mpStatus=String(sub.status||'').toLowerCase();
   const now=Date.now();const end=row.current_period_end?new Date(row.current_period_end).getTime():0;
   let status=mpStatus==='authorized'?'active':mpStatus==='pending'?'pending':mpStatus==='paused'?'past_due':['cancelled','canceled'].includes(mpStatus)?'canceled':row.status;
   // Cancelamento no fim do ciclo: Mercado Pago já fica cancelado, mas o acesso permanece até a data paga.
   if(['cancelled','canceled'].includes(mpStatus)&&row.cancel_at_period_end&&end>now)status='active';
   let plan=row.plan,scheduled_plan=row.scheduled_plan||null,scheduled_change_at=row.scheduled_change_at||null;
   if(scheduled_plan&&scheduled_change_at&&new Date(scheduled_change_at).getTime()<=now){plan=scheduled_plan;scheduled_plan=null;scheduled_change_at=null}
   const patch={plan,status,scheduled_plan,scheduled_change_at,provider_plan_id:sub.preapproval_plan_id||row.provider_plan_id||null,payer_email:sub.payer_email||row.payer_email||null,next_payment_date:row.cancel_at_period_end?null:(sub.next_payment_date||null),current_period_end:row.cancel_at_period_end?(row.current_period_end||sub.next_payment_date||null):(sub.next_payment_date||row.current_period_end||null),updated_at:new Date().toISOString()};
   await sbFetch(su,sk,`user_subscriptions?id=eq.${encodeURIComponent(row.id)}&user_id=eq.${encodeURIComponent(user.id)}`,{method:'PATCH',prefer:'return=representation',body:JSON.stringify(patch)});updated++;
   if(status==='active'&&!best)best={plan:patch.plan,status,next_payment_date:patch.next_payment_date,current_period_end:patch.current_period_end,cancel_at_period_end:!!row.cancel_at_period_end,scheduled_plan:patch.scheduled_plan,scheduled_change_at:patch.scheduled_change_at};
  }
  return send(res,200,{ok:true,checked,updated,subscription:best});
 }catch(e){console.error('[MIV user sync subscription]',e);return send(res,500,{error:'Não foi possível confirmar sua assinatura agora.'})}
}
