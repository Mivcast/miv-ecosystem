const crypto = require('node:crypto');
const { db } = require('./diagnosis-service.cjs');
const { requireAdmin } = require('./privacy-service.cjs');
const { sameOrigin } = require('./analytics-service.cjs');
const version = 'whatsapp-v1';
const consentText = 'Autorizo a MivCast a entrar em contato pelo WhatsApp com orientações, novidades e ofertas. Posso cancelar essa autorização pelo atendimento.';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };

function validate(input) {
  if (input?.consent !== true || input.consent_version !== version || !uuid.test(input.request_id)) fail(400, 'Confirme a autorização para receber contato pelo WhatsApp.');
  const phone = String(input.phone || '').replace(/[ ()+.-]/g, '');
  const name = String(input.name || '').normalize('NFC').trim();
  const niche = String(input.niche || '').normalize('NFC').trim();
  if (!/^\d{10,15}$/.test(phone) || name.length > 100 || niche.length > 100 || /[<>\u0000-\u001f]/.test(name + niche)) fail(400, 'Confira o telefone com DDD e os dados informados.');
  return { p_request_id: input.request_id, p_phone: phone, p_name: name, p_niche: niche, p_consent_version: version, p_consent_text: consentText };
}

async function capture(req, url, key) {
  if (!sameOrigin(req)) fail(403, 'Origem não permitida.');
  const values = validate(req.body);
  const address = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  values.p_fingerprint = crypto.createHmac('sha256', key).update(address).digest('hex');
  const result = await db(url, key, 'rpc/capture_marketing_lead', { method: 'POST', body: JSON.stringify(values) });
  if (result === 'limited') fail(429, 'Aguarde um pouco antes de enviar um novo contato. Você pode continuar usando o sistema.');
  if (result !== 'saved') fail(503, 'Não foi possível confirmar o registro do contato.');
  return { saved: true };
}

async function admin(url, key, user, token, input) {
  await requireAdmin(url, key, user, token);
  if (input.action === 'leads-admin-list') return { leads: await db(url, key, 'marketing_leads?select=id,name,phone,niche,consent_version,consent_text,consented_at,status&order=consented_at.desc&limit=200') };
  if (!uuid.test(input.lead_id) || input.status !== 'withdrawn') fail(400, 'Contato inválido.');
  await db(url, key, `marketing_leads?id=eq.${input.lead_id}`, { method: 'PATCH', body: JSON.stringify({ status: 'withdrawn', withdrawn_at: new Date().toISOString() }) });
  return { saved: true };
}
module.exports = { validate, capture, admin, version, consentText };
