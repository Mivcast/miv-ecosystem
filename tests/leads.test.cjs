const { test } = require('node:test');
const assert = require('node:assert/strict');
const leads = require('../private/lead-service.cjs');
const input = () => ({request_id:'00000000-0000-4000-8000-000000000001',phone:'(11) 99999-9999',name:'Nome de teste',niche:'Numismática',consent:true,consent_version:leads.version});

test('WhatsApp capture requires explicit versioned consent', () => {
  for (const change of [{consent:false},{consent_version:'old'},{request_id:'invalid'}]) assert.throws(() => leads.validate({...input(),...change}), {status:400});
});
test('WhatsApp contact validation normalizes phone and bounds optional fields', () => {
  const result = leads.validate(input());
  assert.equal(result.p_phone, '11999999999');
  assert.equal(result.p_consent_text, leads.consentText);
  assert.equal(leads.validate({...input(),name:''}).p_name, '');
  for (const change of [{phone:'abc11999999999'},{phone:'123'},{name:'<script>'},{name:'a'.repeat(101)},{niche:'a'.repeat(101)}]) assert.throws(() => leads.validate({...input(),...change}), {status:400});
});
test('cross-origin guest contact cannot reach database', async () => {
  await assert.rejects(leads.capture({headers:{origin:'https://other.example',host:'miv.example'},body:input()}, 'https://db.invalid','secret'), {status:403});
});
test('anonymous contact does not accept injected status, consent text or owner', () => {
  const result = leads.validate({...input(),status:'admin',user_id:'attacker',consent_text:'fake'});
  assert.equal(result.p_consent_text, leads.consentText);
  assert(!Object.hasOwn(result,'user_id'));
  assert(!Object.hasOwn(result,'status'));
});

test('guest capture sends validated data to the database and respects its confirmation', async () => {
  const originalFetch = global.fetch;
  let result = 'saved';
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({url,body:JSON.parse(options.body)});
    return {ok:true,json:async () => result};
  };
  const req = {headers:{host:'miv.example',origin:'https://miv.example','x-forwarded-for':'192.0.2.1'},body:input()};
  try {
    assert.deepEqual(await leads.capture(req,'https://db.invalid','fixture'), {saved:true});
    assert.equal(calls[0].url,'https://db.invalid/rest/v1/rpc/capture_marketing_lead');
    assert.equal(calls[0].body.p_phone,'11999999999');
    assert.match(calls[0].body.p_fingerprint,/^[a-f0-9]{64}$/);
    assert(!JSON.stringify(calls[0].body).includes('192.0.2.1'));
    result = 'limited';
    await assert.rejects(leads.capture(req,'https://db.invalid','fixture'), {status:429});
    result = null;
    await assert.rejects(leads.capture(req,'https://db.invalid','fixture'), {status:503});
  } finally {global.fetch = originalFetch;}
});
