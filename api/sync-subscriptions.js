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
  const prof=await sbFetch(su,sk,`profiles?id=eq.${encodeURIComponent(user.id)}&select=role&limit=1`);
  if(prof?.[0]?.role!=='admin')return send(res,403,{error:'Acesso restrito ao administrador.'});
  const subs=await sbFetch(su,sk,'user_subscriptions?provider=eq.mercadopago&provider_subscription_id=not.is.null&select=*&order=created_at.desc');
  let checked=0,updated=0,failed=0;const details=[];
  for(const row of (subs||[])){
   const sid=String(row.provider_subscription_id||'').trim();if(!sid)continue;checked++;
   try{
    const r=await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(sid)}`,{headers:{Authorization:`Bearer ${mp}`}});
    const sub=await r.json().catch(()=>({}));
    if(!r.ok){failed++;details.push({id:sid,ok:false,status:r.status});continue}
    const mpStatus=String(sub.status||'').toLowerCase();
    const status=mpStatus==='authorized'?'active':mpStatus==='pending'?'pending':mpStatus==='paused'?'past_due':['cancelled','canceled'].includes(mpStatus)?'canceled':row.status;
    const patch={status,provider_plan_id:sub.preapproval_plan_id||row.provider_plan_id||null,payer_email:sub.payer_email||row.payer_email||null,next_payment_date:sub.next_payment_date||null,current_period_end:sub.next_payment_date||row.current_period_end||null,updated_at:new Date().toISOString()};
    await sbFetch(su,sk,`user_subscriptions?id=eq.${encodeURIComponent(row.id)}`,{method:'PATCH',prefer:'return=representation',body:JSON.stringify(patch)});
    updated++;details.push({id:sid,ok:true,mp_status:mpStatus,status});
   }catch(e){failed++;details.push({id:sid,ok:false,error:String(e.message||e)})}
  }
  return send(res,200,{ok:true,checked,updated,failed,details});
 }catch(e){console.error('[MIV admin sync subscriptions]',e);return send(res,500,{error:'Não foi possível sincronizar as assinaturas.'})}
}
