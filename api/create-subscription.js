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
function norm(v){return String(v||'').trim().toLowerCase()}
const DEFAULT_SUBSCRIPTION_PLANS={
 pro:{plan_key:'pro',name:'Pro',description:'Todos os cards PRO, análises e relatórios completos, com uso moderado do MARK.IA.',price_cents:4790,currency_id:'BRL',frequency:1,frequency_type:'months'},
 premium:{plan_key:'premium',name:'Premium',description:'Tudo do PRO com uso amplo do MARK.IA e inteligência avançada.',price_cents:9790,currency_id:'BRL',frequency:1,frequency_type:'months'}
};
function normalizePlan(row,planKey){
 const base=DEFAULT_SUBSCRIPTION_PLANS[planKey];
 return {...base,...(row||{}),price_cents:Number(row?.price_cents)>0?Number(row.price_cents):base.price_cents,currency_id:row?.currency_id||base.currency_id,frequency:Number(row?.frequency)>0?Number(row.frequency):base.frequency,frequency_type:row?.frequency_type||base.frequency_type};
}
function couponMatchesPlan(coupon,planKey){
 const item=norm(coupon?.item_id);
 return !item||item===planKey||item===`plan:${planKey}`||item===`${planKey}-subscription`;
}
const MIN_SUBSCRIPTION_COUPON_CENTS=100;
async function validateSubscriptionCoupon(su,sk,user,planKey,priceCents,code){
 const normalized=String(code||'').trim().toUpperCase();
 if(!normalized)return null;
 const rows=await sb(su,sk,`coupons?code=eq.${encodeURIComponent(normalized)}&active=eq.true&select=*&limit=1`);
 const coupon=rows?.[0];
 if(!coupon)return {error:'Cupom inválido ou inativo.'};
 const now=Date.now();
 if(coupon.starts_at&&new Date(coupon.starts_at).getTime()>now)return {error:'Este cupom ainda não está válido.'};
 if(coupon.expires_at&&new Date(coupon.expires_at).getTime()<now)return {error:'Este cupom expirou.'};
 if(!couponMatchesPlan(coupon,planKey))return {error:'Este cupom não vale para este plano.'};
 const reds=await sb(su,sk,`coupon_redemptions?coupon_id=eq.${encodeURIComponent(coupon.id)}&select=user_id`);
 if(coupon.max_uses&&reds.length>=coupon.max_uses)return {error:'Este cupom atingiu o limite de usos.'};
 if(coupon.max_uses_per_user&&reds.filter(x=>x.user_id===user.id).length>=coupon.max_uses_per_user)return {error:'Você já utilizou este cupom.'};
 let discountCents=coupon.discount_type==='percent'?Math.round(priceCents*Math.min(Number(coupon.discount_value),100)/100):Math.round(Number(coupon.discount_value)*100);
 discountCents=Math.max(0,Math.min(discountCents,priceCents));
 return {coupon,discountCents,finalCents:priceCents-discountCents};
}
module.exports=async function(req,res){
 if(req.method!=='POST')return send(res,405,{error:'Método não permitido.'});
 try{
  const su=process.env.SUPABASE_URL,pk=process.env.SUPABASE_PUBLISHABLE_KEY,sk=process.env.SUPABASE_SECRET_KEY,mp=process.env.MERCADOPAGO_ACCESS_TOKEN;
  if(!su||!pk||!sk||!mp)return send(res,500,{error:'Servidor não configurado.'});
  const jwt=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');const user=await userFromJwt(su,pk,jwt);if(!user?.id||!user.email)return send(res,401,{error:'Entre na sua conta para assinar.'});
  const planKey=String(req.body?.plan||'').toLowerCase();if(!['pro','premium'].includes(planKey))return send(res,400,{error:'Plano inválido.'});
  const plans=await sb(su,sk,`subscription_plans?plan_key=eq.${encodeURIComponent(planKey)}&active=eq.true&select=*&limit=1`);const plan=normalizePlan(plans?.[0],planKey);

  const rows=await sb(su,sk,`user_subscriptions?user_id=eq.${encodeURIComponent(user.id)}&provider=eq.mercadopago&status=in.(active,pending)&select=*&order=created_at.desc&limit=10`);
  const active=(rows||[]).find(x=>x.status==='active')||null;
  const pendingSame=(rows||[]).filter(x=>x.status==='pending'&&x.plan===planKey&&x.provider_subscription_id);

  if(active?.plan===planKey)return send(res,409,{error:`Você já está no plano ${planKey==='premium'?'Premium':'PRO'}.`});
  if(active?.plan==='premium'&&planKey==='pro')return send(res,409,{error:'Downgrade do Premium para o PRO deve ser agendado para o próximo ciclo. Use a Minha Central.'});
  const planPriceCents=Number(plan.price_cents);
  const couponResult=await validateSubscriptionCoupon(su,sk,user,planKey,planPriceCents,req.body?.coupon_code);
  if(couponResult?.error)return send(res,400,{error:couponResult.error});

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
  const recurringCents=couponResult?.coupon?Math.max(MIN_SUBSCRIPTION_COUPON_CENTS,couponResult.finalCents):planPriceCents;
  const extraRef=[isUpgrade?'upgrade':null,couponResult?.coupon?`coupon:${couponResult.coupon.id}`:null,couponResult?.coupon?`discount:${couponResult.discountCents}`:null].filter(Boolean).join('|');
  const body={reason:`MIV Ecosystem ${plan.name}`,external_reference:`miv-sub|${user.id}|${planKey}${extraRef?'|'+extraRef:''}`,payer_email:payerEmail,auto_recurring:{frequency:Number(plan.frequency||1),frequency_type:plan.frequency_type||'months',transaction_amount:recurringCents/100,currency_id:plan.currency_id||'BRL'},back_url:`${origin}/?subscription=return`,status:'pending'};
  const r=await fetch('https://api.mercadopago.com/preapproval',{method:'POST',headers:{Authorization:`Bearer ${mp}`,'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json().catch(()=>({}));if(!r.ok){console.error('[MIV subscription create]',r.status,{isTestToken,hasTestPayerEmail:!!testPayerEmail,payerMode:isTestToken?'test':'real',mpError:data});return send(res,502,{error:mpSubscriptionError(data)})}
  const row={user_id:user.id,plan:planKey,status:String(data.status||'pending'),provider:'mercadopago',provider_subscription_id:String(data.id||''),payer_email:payerEmail,current_period_start:new Date().toISOString(),current_period_end:null,next_payment_date:data.next_payment_date||null,updated_at:new Date().toISOString()};
  await sb(su,sk,'user_subscriptions',{method:'POST',prefer:'resolution=merge-duplicates,return=representation',body:JSON.stringify(row)});
  const initPoint=isTestToken?(data.sandbox_init_point||data.init_point||null):(data.init_point||data.sandbox_init_point||null);
  return send(res,200,{ok:true,id:data.id,status:data.status,init_point:initPoint,upgrade:isUpgrade,coupon:couponResult?.coupon?.code||null,discounted_amount:recurringCents/100});
 }catch(e){console.error('[MIV subscription create]',e);return send(res,500,{error:'Erro ao iniciar assinatura.'})}
}
