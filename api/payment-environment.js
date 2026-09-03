const {paymentEnvironment,publicSiteUrl}=require('./_payment-env');
module.exports=async function(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Método não permitido.'});
  const mp=process.env.MERCADOPAGO_ACCESS_TOKEN||'';
  const env=paymentEnvironment(mp);
  return res.status(200).json({
    ok:true,
    payment_environment:env.effective,
    configured_mode:env.configured,
    credential_detected:env.detected,
    site_url:publicSiteUrl(req),
    test_payer_configured:env.effective==='test'&&!!String(process.env.MERCADOPAGO_TEST_PAYER_EMAIL||'').trim(),
    webhook_secret_configured:!!String(process.env.MERCADOPAGO_WEBHOOK_SECRET||'').trim()
  });
};
