function send(res,s,b){return res.status(s).json(b)}
async function userFromJwt(url,pub,jwt){const r=await fetch(`${url}/auth/v1/user`,{headers:{apikey:pub,Authorization:`Bearer ${jwt}`}});return r.ok?r.json():null}
module.exports=async function(req,res){
 if(req.method!=='POST')return send(res,405,{error:'Método não permitido.'});
 try{
  const su=process.env.SUPABASE_URL,pk=process.env.SUPABASE_PUBLISHABLE_KEY,sk=process.env.SUPABASE_SECRET_KEY,mp=process.env.MERCADOPAGO_ACCESS_TOKEN;const jwt=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');const u=await userFromJwt(su,pk,jwt);if(!u?.id)return send(res,401,{error:'Sessão inválida.'});
  const q=await fetch(`${su}/rest/v1/user_subscriptions?user_id=eq.${u.id}&status=eq.active&provider=eq.mercadopago&select=*&order=created_at.desc&limit=1`,{headers:{apikey:sk}});const rows=await q.json();const sub=rows?.[0];if(!sub?.provider_subscription_id)return send(res,404,{error:'Assinatura ativa não encontrada.'});
  const gr=await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(sub.provider_subscription_id)}`,{headers:{Authorization:`Bearer ${mp}`}});const gd=await gr.json().catch(()=>({}));if(!gr.ok)return send(res,502,{error:'Não foi possível consultar a assinatura.'});
  const end=gd.next_payment_date||sub.next_payment_date||sub.current_period_end||null;
  const mr=await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(sub.provider_subscription_id)}`,{method:'PUT',headers:{Authorization:`Bearer ${mp}`,'Content-Type':'application/json'},body:JSON.stringify({status:'cancelled'})});const md=await mr.json().catch(()=>({}));if(!mr.ok)return send(res,502,{error:md?.message||'Não foi possível cancelar no Mercado Pago.'});
  await fetch(`${su}/rest/v1/user_subscriptions?id=eq.${sub.id}`,{method:'PATCH',headers:{apikey:sk,'Content-Type':'application/json'},body:JSON.stringify({status:'active',cancel_at_period_end:true,current_period_end:end,next_payment_date:null,scheduled_plan:null,scheduled_change_at:null,updated_at:new Date().toISOString()})});
  return send(res,200,{ok:true,status:'active',cancel_at_period_end:true,current_period_end:end});
 }catch(e){console.error('[MIV cancel subscription]',e);return send(res,500,{error:'Erro ao cancelar assinatura.'})}
}
