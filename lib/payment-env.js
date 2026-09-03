function normalizeMode(value){
  const v=String(value||'').trim().toLowerCase();
  return ['test','production','auto'].includes(v)?v:'auto';
}

function tokenEnvironment(token){
  const t=String(token||'').trim();
  if(!t) return 'missing';
  if(/^TEST-/i.test(t)) return 'test';
  return 'production';
}

function paymentEnvironment(token){
  const configured=normalizeMode(process.env.MIV_PAYMENT_MODE);
  const detected=tokenEnvironment(token);
  const effective=configured==='auto'?detected:configured;
  return {configured,detected,effective};
}

function validatePaymentEnvironment(token){
  const env=paymentEnvironment(token);
  if(env.detected==='missing') return {ok:false,...env,error:'Mercado Pago não configurado.'};
  if(env.configured!=='auto' && env.configured!==env.detected){
    return {ok:false,...env,error:env.configured==='production'
      ?'Ambiente de produção está ativo, mas a credencial do Mercado Pago é de teste.'
      :'Ambiente de teste está ativo, mas a credencial do Mercado Pago parece ser de produção.'};
  }
  return {ok:true,...env};
}

function publicSiteUrl(req){
  const explicit=String(process.env.MIV_SITE_URL||'').trim().replace(/\/+$/,'');
  if(explicit) return explicit;
  const forwardedProto=String(req?.headers?.['x-forwarded-proto']||'').split(',')[0].trim();
  const proto=forwardedProto||'https';
  const host=String(req?.headers?.['x-forwarded-host']||req?.headers?.host||'miv-ecosystem.vercel.app').split(',')[0].trim();
  return `${proto}://${host}`.replace(/\/+$/,'');
}

function checkoutUrl(data, effective){
  if(effective==='test') return data?.sandbox_init_point||data?.init_point||null;
  return data?.init_point||null;
}

module.exports={normalizeMode,tokenEnvironment,paymentEnvironment,validatePaymentEnvironment,publicSiteUrl,checkoutUrl};
