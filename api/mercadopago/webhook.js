const crypto = require('crypto');

const FALLBACK_ITEM_CATALOG = {
  whatsapp: {
    title: 'Script inteligente de WhatsApp',
    amount_cents: 1990,
    item_type: 'card'
  }
};

function send(res, status, body) {
  return res.status(status).json(body);
}

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeItemId(value) {
  const key = String(value || '').trim().toLowerCase();
  const aliases = {
    'script-whatsapp': 'whatsapp',
    'whatsapp-script': 'whatsapp'
  };
  return aliases[key] || key;
}

function parseSignature(xSignature) {
  const parsed = {};
  String(xSignature || '').split(',').forEach((part) => {
    const index = part.indexOf('=');
    if (index === -1) return;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key && value) parsed[key] = value;
  });
  return parsed;
}

function safeHexEqual(a, b) {
  if (!/^[a-f0-9]+$/i.test(String(a || '')) || !/^[a-f0-9]+$/i.test(String(b || ''))) return false;
  const left = Buffer.from(String(a), 'hex');
  const right = Buffer.from(String(b), 'hex');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function getQueryParam(req, name) {
  // Em Vercel, nomes com ponto (ex.: data.id) podem variar conforme a camada
  // que fez o parsing. Lemos primeiro a URL bruta com WHATWG URL e usamos
  // req.query somente como fallback.
  try {
    const rawUrl = String(req.url || '');
    const parsed = new URL(rawUrl, 'https://miv-ecosystem.local');
    const value = parsed.searchParams.get(name);
    if (value != null) return value;
  } catch (_) {}

  const direct = first(req.query?.[name]);
  if (direct != null) return direct;

  // Compatibilidade com exemplos antigos da documentação que usam data_id.
  if (name === 'data.id') {
    const legacy = first(req.query?.data_id);
    if (legacy != null) return legacy;
  }
  return null;
}

function addUniqueCandidate(candidates, value, source) {
  if (value == null) return;
  const raw = String(value).trim();
  if (!raw) return;

  const values = [raw];
  const lower = raw.toLowerCase();
  if (lower !== raw) values.push(lower);

  values.forEach((candidate) => {
    if (!candidates.some((item) => item.value === candidate)) {
      candidates.push({ value: candidate, source });
    }
  });
}

function getWebhookDataIdCandidates(req) {
  const candidates = [];

  addUniqueCandidate(candidates, getQueryParam(req, 'data.id'), 'query:data.id');
  addUniqueCandidate(candidates, getQueryParam(req, 'id'), 'query:id');
  addUniqueCandidate(candidates, req.body?.data?.id, 'body:data.id');
  addUniqueCandidate(candidates, req.body?.id, 'body:id');

  return candidates;
}

function verifyMercadoPagoSignature(req, secretInput) {
  const xSignature = first(req.headers['x-signature']);
  const xRequestIdRaw = first(req.headers['x-request-id']);
  const xRequestId = xRequestIdRaw == null ? '' : String(xRequestIdRaw).trim();
  const candidates = getWebhookDataIdCandidates(req);
  const secret = String(secretInput || '').trim();

  if (!secret) return { ok: false, reason: 'missing_secret' };
  if (!xSignature) return { ok: false, reason: 'missing_x_signature' };

  const { ts, v1 } = parseSignature(xSignature);
  if (!ts || !v1) return { ok: false, reason: 'invalid_x_signature' };

  // Manifest oficial do Mercado Pago:
  // id:<data.id>;request-id:<x-request-id>;ts:<ts>;
  // Campos ausentes são omitidos.
  const manifestInputs = candidates.length ? candidates : [{ value: '', source: 'no-id' }];
  if (candidates.length) manifestInputs.push({ value: '', source: 'no-id' });

  for (const candidate of manifestInputs) {
    let manifest = '';
    if (candidate.value) manifest += `id:${candidate.value};`;
    if (xRequestId) manifest += `request-id:${xRequestId};`;
    if (ts) manifest += `ts:${ts};`;

    const expected = crypto.createHmac('sha256', secret).update(manifest, 'utf8').digest('hex');
    const ok = safeHexEqual(expected, String(v1).trim());
    if (ok) {
      return {
        ok: true,
        reason: null,
        resourceDataId: candidate.value,
        signatureIdSource: candidate.source,
        debug: {
          hasQueryDataId: candidates.some((item) => item.source === 'query:data.id'),
          hasQueryId: candidates.some((item) => item.source === 'query:id'),
          hasBodyDataId: candidates.some((item) => item.source === 'body:data.id'),
          hasBodyId: candidates.some((item) => item.source === 'body:id'),
          hasRequestId: Boolean(xRequestId),
          hasTimestamp: Boolean(ts),
          secretLength: secret.length,
          testedManifests: manifestInputs.length
        }
      };
    }
  }

  return {
    ok: false,
    reason: 'signature_mismatch',
    resourceDataId: candidates[0]?.value || '',
    // Diagnóstico seguro: não registra segredo, assinatura ou manifest completo.
    debug: {
      hasQueryDataId: candidates.some((item) => item.source === 'query:data.id'),
      hasQueryId: candidates.some((item) => item.source === 'query:id'),
      hasBodyDataId: candidates.some((item) => item.source === 'body:data.id'),
      hasBodyId: candidates.some((item) => item.source === 'body:id'),
      hasRequestId: Boolean(xRequestId),
      hasTimestamp: Boolean(ts),
      secretLength: secret.length,
      testedManifests: manifestInputs.length
    }
  };
}

async function getMercadoPagoPayment(paymentId, accessToken) {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

async function getCatalogItem({ supabaseUrl, secretKey, itemId }) {
  const response = await fetch(`${supabaseUrl}/rest/v1/ecosystem_cards?item_id=eq.${encodeURIComponent(itemId)}&active=eq.true&select=item_id,title,price_cents,access_level&limit=1`, {
    headers: { apikey: secretKey }
  });
  const rows = await response.json().catch(() => []);
  if (response.ok) {
    const item = rows?.[0];
    if (item && Number.isInteger(item.price_cents) && item.price_cents >= 0) {
      return {
        title: item.title,
        amount_cents: item.price_cents,
        item_type: 'card',
        access_level: item.access_level || null
      };
    }
  } else {
    console.error('[MIV webhook] Falha ao consultar catálogo:', response.status, rows);
  }
  return FALLBACK_ITEM_CATALOG[itemId] || null;
}

async function upsertPurchase({ supabaseUrl, secretKey, row }) {
  const endpoint = `${supabaseUrl}/rest/v1/user_purchases?on_conflict=user_id,item_type,item_id`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: secretKey,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation'
    },
    body: JSON.stringify(row)
  });
  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}

function subscriptionCouponRef(externalReference) {
  const parts = String(externalReference || '').split('|');
  const out = {};
  parts.forEach((part) => {
    const index = part.indexOf(':');
    if (index > 0) out[part.slice(0, index)] = part.slice(index + 1);
  });
  return out.coupon ? { couponId: out.coupon, discountCents: Number(out.discount || 0) } : null;
}

async function recordSubscriptionCoupon({ supabaseUrl, secretKey, userId, plan, subscription }) {
  const ref = subscriptionCouponRef(subscription.external_reference);
  if (!ref?.couponId) return;
  const itemId = `plan:${plan}`;
  const existingResp = await fetch(`${supabaseUrl}/rest/v1/coupon_redemptions?coupon_id=eq.${encodeURIComponent(ref.couponId)}&user_id=eq.${encodeURIComponent(userId)}&item_id=eq.${encodeURIComponent(itemId)}&select=id&limit=1`, {
    headers: { apikey: secretKey }
  });
  const existing = existingResp.ok ? await existingResp.json().catch(() => []) : [];
  if (existing?.length) return;
  const redResp = await fetch(`${supabaseUrl}/rest/v1/coupon_redemptions`, {
    method: 'POST',
    headers: { apikey: secretKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ coupon_id: ref.couponId, user_id: userId, item_id: itemId, discount_cents: ref.discountCents, redeemed_at: new Date().toISOString() })
  });
  if (!redResp.ok) console.error('[MIV webhook subscription] Assinatura ativa, mas falhou registro do cupom:', await redResp.text());
}

module.exports = async function handler(req, res) {
  // Ajuda a confirmar rapidamente que a rota foi publicada, sem processar nada.
  if (req.method === 'GET') {
    return send(res, 200, { ok: true, service: 'miv-mercadopago-webhook', version: '13.36' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return send(res, 405, { error: 'Método não permitido.' });
  }

  try {
    const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!mpToken || !webhookSecret || !supabaseUrl || !supabaseSecretKey) {
      console.error('[MIV webhook] Variáveis de ambiente incompletas.');
      return send(res, 500, { error: 'Webhook não configurado no servidor.' });
    }

    const signature = verifyMercadoPagoSignature(req, webhookSecret);
    if (!signature.ok) {
      console.warn('[MIV webhook] Assinatura inválida:', signature.reason, signature.debug || {});
      return send(res, 401, { error: 'Assinatura inválida.' });
    }

    const type = String(req.body?.type || first(req.query?.type) || '').toLowerCase();

    if (type === 'subscription_preapproval') {
      const subscriptionId = String(signature.resourceDataId || req.body?.data?.id || '').trim();
      if (!subscriptionId) return send(res, 200, {received:true,verified:true,processed:false,reason:'missing_subscription_id'});
      const sr = await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(subscriptionId)}`, {headers:{Authorization:`Bearer ${mpToken}`}});
      const sub = await sr.json().catch(()=>({}));
      if (!sr.ok) return send(res, 200, {received:true,verified:true,processed:false,reason:'subscription_unavailable'});
      const parts=String(sub.external_reference||'').split('|');
      const userId=parts[0]==='miv-sub'?String(parts[1]||''):''; const plan=parts[0]==='miv-sub'?String(parts[2]||''):'';
      const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if(!uuidPattern.test(userId)||!['pro','premium'].includes(plan)) return send(res,200,{received:true,verified:true,processed:false,reason:'invalid_subscription_metadata'});
      const existingResp=await fetch(`${supabaseUrl}/rest/v1/user_subscriptions?provider_subscription_id=eq.${encodeURIComponent(String(sub.id||subscriptionId))}&select=*&limit=1`,{headers:{apikey:supabaseSecretKey}});
      const existingRows=existingResp.ok?await existingResp.json().catch(()=>[]):[];const existing=existingRows?.[0]||null;
      const mpStatus=String(sub.status||'').toLowerCase();
      const now=Date.now();const paidEnd=existing?.current_period_end?new Date(existing.current_period_end).getTime():0;
      let status=mpStatus==='authorized'?'active':mpStatus==='pending'?'pending':mpStatus==='paused'?'past_due':['cancelled','canceled'].includes(mpStatus)?'canceled':'pending';
      if(['cancelled','canceled'].includes(mpStatus)&&existing?.cancel_at_period_end&&paidEnd>now)status='active';
      let effectivePlan=existing?.plan||plan,scheduledPlan=existing?.scheduled_plan||null,scheduledAt=existing?.scheduled_change_at||null;
      if(scheduledPlan&&scheduledAt&&new Date(scheduledAt).getTime()<=now){effectivePlan=scheduledPlan;scheduledPlan=null;scheduledAt=null}
      const row={user_id:userId,plan:effectivePlan,status,provider:'mercadopago',provider_subscription_id:String(sub.id||subscriptionId),provider_plan_id:sub.preapproval_plan_id||null,payer_email:sub.payer_email||existing?.payer_email||null,current_period_start:existing?.current_period_start||sub.date_created||new Date().toISOString(),current_period_end:existing?.cancel_at_period_end?(existing.current_period_end||sub.next_payment_date||null):(sub.next_payment_date||existing?.current_period_end||null),next_payment_date:existing?.cancel_at_period_end?null:(sub.next_payment_date||null),cancel_at_period_end:!!existing?.cancel_at_period_end,scheduled_plan:scheduledPlan,scheduled_change_at:scheduledAt,last_payment_status:sub.summarized?.last_charged_amount?'charged':existing?.last_payment_status||null,updated_at:new Date().toISOString()};
      const ur=await fetch(`${supabaseUrl}/rest/v1/user_subscriptions?on_conflict=provider_subscription_id`,{method:'POST',headers:{apikey:supabaseSecretKey,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(row)});
      if(!ur.ok){console.error('[MIV webhook subscription] Supabase',ur.status,await ur.text());return send(res,500,{error:'Falha ao atualizar assinatura.'})}
      if(status==='active')await recordSubscriptionCoupon({supabaseUrl,secretKey:supabaseSecretKey,userId,plan:row.plan,subscription:sub});

      // Upgrade seguro: o PRO continua ativo enquanto o cliente está no checkout Premium.
      // Só depois que o Mercado Pago confirma o Premium como authorized encerramos a recorrência PRO anterior.
      // Isso evita o cliente perder o PRO caso desista ou o pagamento Premium falhe.
      if(status==='active'&&row.plan==='premium'){
        const oldResp=await fetch(`${supabaseUrl}/rest/v1/user_subscriptions?user_id=eq.${encodeURIComponent(userId)}&plan=eq.pro&status=eq.active&provider=eq.mercadopago&provider_subscription_id=not.is.null&provider_subscription_id=neq.${encodeURIComponent(String(sub.id||subscriptionId))}&select=id,provider_subscription_id`,{headers:{apikey:supabaseSecretKey}});
        const olds=oldResp.ok?await oldResp.json().catch(()=>[]):[];
        for(const old of (olds||[])){
          const cr=await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(old.provider_subscription_id)}`,{method:'PUT',headers:{Authorization:`Bearer ${mpToken}`,'Content-Type':'application/json'},body:JSON.stringify({status:'cancelled'})});
          if(!cr.ok){console.error('[MIV webhook upgrade] Não foi possível cancelar PRO anterior',old.provider_subscription_id,cr.status);continue}
          await fetch(`${supabaseUrl}/rest/v1/user_subscriptions?id=eq.${encodeURIComponent(old.id)}`,{method:'PATCH',headers:{apikey:supabaseSecretKey,'Content-Type':'application/json'},body:JSON.stringify({status:'canceled',cancel_at_period_end:false,updated_at:new Date().toISOString()})});
        }
      }
      await fetch(`${supabaseUrl}/rest/v1/subscription_events`,{method:'POST',headers:{apikey:supabaseSecretKey,'Content-Type':'application/json'},body:JSON.stringify({user_id:userId,provider:'mercadopago',provider_subscription_id:String(sub.id||subscriptionId),event_type:type,provider_status:mpStatus,payload:{id:sub.id,status:sub.status,next_payment_date:sub.next_payment_date}})});
      console.log('[MIV webhook] Assinatura atualizada:',{userId,plan:row.plan,status,subscriptionId});
      return send(res,200,{received:true,verified:true,processed:true,subscription:true,status});
    }

    if (type && type !== 'payment' && type !== 'subscription_authorized_payment') {
      return send(res, 200, { received: true, verified: true, processed: false, reason: 'event_ignored' });
    }
    if(type==='subscription_authorized_payment') return send(res,200,{received:true,verified:true,processed:false,reason:'invoice_event_acknowledged'});

    const paymentId = String(signature.resourceDataId || req.body?.data?.id || '').trim();
    if (!paymentId) {
      return send(res, 200, { received: true, verified: true, processed: false, reason: 'missing_payment_id' });
    }

    const paymentResult = await getMercadoPagoPayment(paymentId, mpToken);

    // O simulador do painel pode usar um Data ID que não é um pagamento real. Nesse caso,
    // a assinatura e a recepção já foram validadas; devolvemos 200 sem liberar conteúdo.
    if (!paymentResult.ok) {
      console.log('[MIV webhook] Evento verificado; pagamento não consultável:', paymentId, paymentResult.status);
      return send(res, 200, {
        received: true,
        verified: true,
        processed: false,
        reason: 'payment_not_found_or_unavailable'
      });
    }

    const payment = paymentResult.data || {};
    if (String(payment.status || '').toLowerCase() !== 'approved') {
      return send(res, 200, {
        received: true,
        verified: true,
        processed: false,
        reason: 'payment_not_approved',
        payment_status: payment.status || null
      });
    }

    const metadata = payment.metadata || {};
    let userId = String(metadata.miv_user_id || '').trim();
    let itemType = String(metadata.miv_item_type || '').trim().toLowerCase();
    let itemId = normalizeItemId(metadata.miv_item_id);

    // Compatibilidade com preferências que tragam somente external_reference.
    if ((!userId || !itemType || !itemId) && payment.external_reference) {
      const parts = String(payment.external_reference).split('|');
      if (parts.length === 3) {
        userId = userId || String(parts[0] || '').trim();
        itemType = itemType || String(parts[1] || '').trim().toLowerCase();
        itemId = itemId || normalizeItemId(parts[2]);
      }
    }

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const catalogItem = await getCatalogItem({ supabaseUrl, secretKey: supabaseSecretKey, itemId });
    if (!uuidPattern.test(userId) || !catalogItem || itemType !== catalogItem.item_type) {
      console.error('[MIV webhook] Metadados de compra inválidos.', { userId, itemId, itemType });
      return send(res, 200, { received: true, verified: true, processed: false, reason: 'invalid_purchase_metadata' });
    }

    const paidCents = Math.round(Number(payment.transaction_amount || 0) * 100);
    const expectedCents = Number(metadata.miv_expected_amount_cents ?? catalogItem.amount_cents);
    if (paidCents !== expectedCents) {
      console.error('[MIV webhook] Valor divergente.', { itemId, paidCents, expected: expectedCents });
      return send(res, 200, { received: true, verified: true, processed: false, reason: 'amount_mismatch' });
    }

    const providerPaymentId = String(payment.id || paymentId);
    const purchaseRow = {
      user_id: userId,
      item_id: itemId,
      item_type: catalogItem.item_type,
      status: 'paid',
      amount_cents: paidCents,
      provider: 'mercadopago',
      provider_payment_id: providerPaymentId,
      purchased_at: payment.date_approved || new Date().toISOString()
    };

    const saveResult = await upsertPurchase({
      supabaseUrl,
      secretKey: supabaseSecretKey,
      row: purchaseRow
    });

    if (!saveResult.ok) {
      console.error('[MIV webhook] Falha ao gravar compra no Supabase:', saveResult.status, saveResult.data);
      // 500 faz o Mercado Pago tentar novamente.
      return send(res, 500, { error: 'Falha ao registrar a compra.' });
    }

    const couponId = String(metadata.miv_coupon_id || '').trim();
    if (couponId) {
      const redemption = {coupon_id: couponId, user_id: userId, item_id: itemId, purchase_id: saveResult.data?.[0]?.id || null, discount_cents: Number(metadata.miv_discount_cents || 0), redeemed_at: new Date().toISOString()};
      const redResp = await fetch(`${supabaseUrl}/rest/v1/coupon_redemptions`, {method:'POST',headers:{apikey:supabaseSecretKey,'Content-Type':'application/json'},body:JSON.stringify(redemption)});
      if (!redResp.ok) console.error('[MIV webhook] Compra liberada, mas falhou registro do cupom:', await redResp.text());
    }

    console.log('[MIV webhook] Compra liberada:', { userId, itemId, providerPaymentId });
    return send(res, 200, {
      received: true,
      verified: true,
      processed: true,
      item_id: itemId
    });
  } catch (error) {
    console.error('[MIV webhook] Erro inesperado:', error);
    return send(res, 500, { error: 'Erro interno no Webhook.' });
  }
};
