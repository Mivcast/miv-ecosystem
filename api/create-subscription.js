function send(res,s,b){return res.status(s).json(b)}
async function sb(url,key,path,opts={}){const r=await fetch(`${url}/rest/v1/${path}`,{...opts,headers:{apikey:key,'Content-Type':'application/json',Prefer:opts.prefer||'',...(opts.headers||{})}});const t=await r.text();let d=null;try{d=t?JSON.parse(t):null}catch{d=t}if(!r.ok)throw new Error(`Supabase ${r.status}: ${typeof d==='string'?d:JSON.stringify(d)}`);return d}
async function userFromJwt(url,pub,jwt){const r=await fetch(`${url}/auth/v1/user`,{headers:{apikey:pub,Authorization:`Bearer ${jwt}`}});if(!r.ok)return null;return r.json()}
async function cancelMpSubscription(mp,id){if(!id)return false;const r=await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(id)}`,{method:'PUT',headers:{Authorization:`Bearer ${mp}`,'Content-Type':'application/json'},body:JSON.stringify({status:'cancelled'})});return r.ok}
function mpSubscriptionError(data){
 const message=String(data?.message||data?.error||'');
 if(/both payer and collector must be real or test users/i.test(message)){
  return 'No sandbox do Mercado Pago, vendedor e comprador precisam ser usuários de teste. Use um Access Token de vendedor teste e configure MERCADOPAGO_TEST_PAYER_EMAIL com o e-mail do comprador teste.';
 }
 return message||'Não foi possível iniciar a assinatura.';
}
module.exports=async function(req,res){
 if(req.method!=='POST')return send(res,405,{error:'Método não permitido.'});
 try{
  const su=process.env.SUPABASE_URL,pk=process.env.SUPABASE_PUBLISHABLE_KEY,sk=process.env.SUPABASE_SECRET_KEY,mp=process.env.MERCADOPAGO_ACCESS_TOKEN;
  if(!su||!pk||!sk||!mp)return send(res,500,{error:'Servidor não configurado.'});
  const jwt=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');const user=await userFromJwt(su,pk,jwt);if(!user?.id||!user.email)return send(res,401,{error:'Entre na sua conta para assinar.'});
  const planKey=String(req.body?.plan||'').toLowerCase();if(!['pro','premium'].includes(planKey))return send(res,400,{error:'Plano inválido.'});
  const plans=await sb(su,sk,`subscription_plans?plan_key=eq.${encodeURIComponent(planKey)}&active=eq.true&select=*&limit=1`);const plan=plans?.[0];
  if(!plan||Number(plan.price_cents)<=0)return send(res,400,{error:'Preço deste plano ainda não foi configurado no Admin.'});

  const rows=await sb(su,sk,`user_subscriptions?user_id=eq.${encodeURIComponent(user.id)}&provider=eq.mercadopago&status=in.(active,pending)&select=*&order=created_at.desc&limit=10`);
  const active=(rows||[]).find(x=>x.status==='active')||null;
  const pendingSame=(rows||[]).filter(x=>x.status==='pending'&&x.plan===planKey&&x.provider_subscription_id);

  if(active?.plan===planKey)return send(res,409,{error:`Você já está no plano ${planKey==='premium'?'Premium':'PRO'}.`});
  if(active?.plan==='premium'&&planKey==='pro')return send(res,409,{error:'Downgrade do Premium para o PRO deve ser agendado para o próximo ciclo. Use a Minha Central.'});

  // Uma tentativa pendente anterior do mesmo plano não deve bloquear o cliente para sempre.
  // Ao iniciar novamente, cancelamos apenas a tentativa PENDENTE antiga. Nunca cancelamos o plano ativo antes do novo pagamento.
  for(const old of pendingSame){
   try{await cancelMpSubscription(mp,old.provider_subscription_id)}catch{}
   await sb(su,sk,`user_subscriptions?id=eq.${encodeURIComponent(old.id)}`,{method:'PATCH',body:JSON.stringify({status:'canceled',updated_at:new Date().toISOString()})});
  }

  const origin=`https://${req.headers['x-forwarded-host']||req.headers.host||'miv-ecosystem.vercel.app'}`;
  // Segurança de ambiente: o payer de teste só pode substituir o e-mail real quando o Access Token é de TESTE.
  // Assim, mesmo que MERCADOPAGO_TEST_PAYER_EMAIL seja esquecida na Vercel, ela não interfere com credenciais produtivas.
  const testPayerEmail=String(process.env.MERCADOPAGO_TEST_PAYER_EMAIL||'').trim();
  const isTestToken=/^TEST-/i.test(String(mp).trim());
  if(isTestToken&&!testPayerEmail)return send(res,500,{error:'Configure MERCADOPAGO_TEST_PAYER_EMAIL com um comprador de teste do Mercado Pago antes de testar assinaturas no sandbox.'});
  const payerEmail=(isTestToken&&testPayerEmail)?testPayerEmail:user.email;
  const isUpgrade=active?.plan==='pro'&&planKey==='premium';
  const body={reason:`MIV Ecosystem ${plan.name}`,external_reference:`miv-sub|${user.id}|${planKey}${isUpgrade?'|upgrade':''}`,payer_email:payerEmail,auto_recurring:{frequency:Number(plan.frequency||1),frequency_type:plan.frequency_type||'months',transaction_amount:Number(plan.price_cents)/100,currency_id:plan.currency_id||'BRL'},back_url:`${origin}/?subscription=return`,status:'pending'};
  const r=await fetch('https://api.mercadopago.com/preapproval',{method:'POST',headers:{Authorization:`Bearer ${mp}`,'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json().catch(()=>({}));if(!r.ok){console.error('[MIV subscription create]',r.status,{isTestToken,hasTestPayerEmail:!!testPayerEmail,payerMode:isTestToken?'test':'real',mpError:data});return send(res,502,{error:mpSubscriptionError(data)})}
  const row={user_id:user.id,plan:planKey,status:String(data.status||'pending'),provider:'mercadopago',provider_subscription_id:String(data.id||''),payer_email:payerEmail,current_period_start:new Date().toISOString(),current_period_end:null,next_payment_date:data.next_payment_date||null,updated_at:new Date().toISOString()};
  await sb(su,sk,'user_subscriptions',{method:'POST',prefer:'resolution=merge-duplicates,return=representation',body:JSON.stringify(row)});
  const initPoint=isTestToken?(data.sandbox_init_point||data.init_point||null):(data.init_point||data.sandbox_init_point||null);
  return send(res,200,{ok:true,id:data.id,status:data.status,init_point:initPoint,upgrade:isUpgrade});
 }catch(e){console.error('[MIV subscription create]',e);return send(res,500,{error:'Erro ao iniciar assinatura.'})}
}
