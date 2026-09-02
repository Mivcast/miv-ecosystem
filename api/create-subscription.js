function send(res,s,b){return res.status(s).json(b)}
async function sb(url,key,path,opts={}){const r=await fetch(`${url}/rest/v1/${path}`,{...opts,headers:{apikey:key,'Content-Type':'application/json',Prefer:opts.prefer||'',...(opts.headers||{})}});const t=await r.text();let d=null;try{d=t?JSON.parse(t):null}catch{d=t}if(!r.ok)throw new Error(`Supabase ${r.status}: ${typeof d==='string'?d:JSON.stringify(d)}`);return d}
async function userFromJwt(url,pub,jwt){const r=await fetch(`${url}/auth/v1/user`,{headers:{apikey:pub,Authorization:`Bearer ${jwt}`}});if(!r.ok)return null;return r.json()}
module.exports=async function(req,res){
 if(req.method!=='POST')return send(res,405,{error:'Método não permitido.'});
 try{
  const su=process.env.SUPABASE_URL,pk=process.env.SUPABASE_PUBLISHABLE_KEY,sk=process.env.SUPABASE_SECRET_KEY,mp=process.env.MERCADOPAGO_ACCESS_TOKEN;
  if(!su||!pk||!sk||!mp)return send(res,500,{error:'Servidor não configurado.'});
  const jwt=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');const user=await userFromJwt(su,pk,jwt);if(!user?.id||!user.email)return send(res,401,{error:'Entre na sua conta para assinar.'});
  const planKey=String(req.body?.plan||'').toLowerCase();if(!['pro','premium'].includes(planKey))return send(res,400,{error:'Plano inválido.'});
  const plans=await sb(su,sk,`subscription_plans?plan_key=eq.${encodeURIComponent(planKey)}&active=eq.true&select=*&limit=1`);const plan=plans?.[0];
  if(!plan||Number(plan.price_cents)<=0)return send(res,400,{error:'Preço deste plano ainda não foi configurado no Admin.'});
  const existing=await sb(su,sk,`user_subscriptions?user_id=eq.${user.id}&status=in.(active,pending)&select=id,plan,provider_subscription_id&order=created_at.desc&limit=1`);
  if(existing?.[0]?.provider_subscription_id)return send(res,409,{error:'Você já possui uma assinatura em andamento. Gerencie-a pela Minha Central.'});
  const origin=`https://${req.headers['x-forwarded-host']||req.headers.host||'miv-ecosystem.vercel.app'}`;
  const body={reason:`MIV Ecosystem ${plan.name}`,external_reference:`miv-sub|${user.id}|${planKey}`,payer_email:user.email,auto_recurring:{frequency:Number(plan.frequency||1),frequency_type:plan.frequency_type||'months',transaction_amount:Number(plan.price_cents)/100,currency_id:plan.currency_id||'BRL'},back_url:`${origin}/?subscription=return`,status:'pending'};
  const r=await fetch('https://api.mercadopago.com/preapproval',{method:'POST',headers:{Authorization:`Bearer ${mp}`,'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json().catch(()=>({}));if(!r.ok){console.error('[MIV subscription create]',r.status,data);return send(res,502,{error:data?.message||'Não foi possível iniciar a assinatura.'})}
  const row={user_id:user.id,plan:planKey,status:String(data.status||'pending'),provider:'mercadopago',provider_subscription_id:String(data.id||''),payer_email:user.email,current_period_start:new Date().toISOString(),current_period_end:null,next_payment_date:data.next_payment_date||null,updated_at:new Date().toISOString()};
  await sb(su,sk,'user_subscriptions',{method:'POST',prefer:'resolution=merge-duplicates,return=representation',body:JSON.stringify(row)});
  return send(res,200,{ok:true,id:data.id,status:data.status,init_point:data.init_point||data.sandbox_init_point||null});
 }catch(e){console.error('[MIV subscription create]',e);return send(res,500,{error:'Erro ao iniciar assinatura.'})}
}
