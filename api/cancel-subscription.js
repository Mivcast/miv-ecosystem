function send(res,s,b){res.setHeader('Cache-Control','private, no-store');return res.status(s).json(b)}
async function userFromJwt(url,pub,jwt){const r=await fetch(`${url}/auth/v1/user`,{headers:{apikey:pub,Authorization:`Bearer ${jwt}`}});return r.ok?r.json():null}
module.exports=async function(req,res){
 if(req.method!=='POST')return send(res,405,{error:'Método não permitido.'});
 try{
  const su=process.env.SUPABASE_URL,pk=process.env.SUPABASE_PUBLISHABLE_KEY,sk=process.env.SUPABASE_SECRET_KEY,mp=process.env.MERCADOPAGO_ACCESS_TOKEN;const jwt=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');if(!jwt)return send(res,401,{error:'Entre na sua conta.'});if(!su||!pk||!sk||!mp)return send(res,503,{error:'Atendimento de assinaturas temporariamente indisponível.'});const u=await userFromJwt(su,pk,jwt);if(!u?.id)return send(res,401,{error:'Sessão inválida.'});
  const q=await fetch(`${su}/rest/v1/user_subscriptions?user_id=eq.${u.id}&status=eq.active&provider=eq.mercadopago&select=*&order=created_at.desc&limit=1`,{headers:{apikey:sk}});if(!q.ok)return send(res,503,{error:'Não foi possível consultar sua assinatura. Tente novamente.'});const rows=await q.json();const sub=rows?.[0];if(!sub?.provider_subscription_id)return send(res,404,{error:'Assinatura ativa não encontrada.'});
  const gr=await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(sub.provider_subscription_id)}`,{headers:{Authorization:`Bearer ${mp}`}});const gd=await gr.json().catch(()=>({}));if(!gr.ok)return send(res,502,{error:'Não foi possível consultar a assinatura.'});
  const end=gd.next_payment_date||sub.next_payment_date||sub.current_period_end||null;
  const mr=await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(sub.provider_subscription_id)}`,{method:'PUT',headers:{Authorization:`Bearer ${mp}`,'Content-Type':'application/json'},body:JSON.stringify({status:'cancelled'})});const md=await mr.json().catch(()=>({}));if(!mr.ok)return send(res,502,{error:md?.message||'Não foi possível cancelar no Mercado Pago.'});
  const saved=await fetch(`${su}/rest/v1/user_subscriptions?id=eq.${sub.id}`,{method:'PATCH',headers:{apikey:sk,'Content-Type':'application/json'},body:JSON.stringify({status:'active',cancel_at_period_end:true,current_period_end:end,next_payment_date:null,scheduled_plan:null,scheduled_change_at:null,updated_at:new Date().toISOString()})});
  if(!saved.ok)return send(res,503,{error:'A renovação foi cancelada no Mercado Pago, mas a Central ainda não sincronizou. Tente novamente ou solicite atendimento.'});
  return send(res,200,{ok:true,status:'active',cancel_at_period_end:true,current_period_end:end});
 }catch(e){console.error('[MIV cancel subscription]',e);return send(res,500,{error:'Erro ao cancelar assinatura.'})}
}
