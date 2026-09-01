const ITEM_CATALOG = {
  whatsapp: {
    title: 'Script inteligente de WhatsApp',
    unit_price: 19.90,
    item_type: 'card'
  }
};

function send(res, status, body) {
  res.status(status).json(body);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'Método não permitido.' });
  }

  try {
    const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!mpToken || !supabaseUrl || !supabaseKey) {
      return send(res, 500, { error: 'Configuração de pagamento incompleta no servidor.' });
    }

    const authHeader = req.headers.authorization || '';
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!accessToken) return send(res, 401, { error: 'Entre na sua conta para comprar.' });

    // Confirma a sessão diretamente no Supabase; não confiamos em user_id enviado pelo navegador.
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${accessToken}`
      }
    });
    if (!userResponse.ok) return send(res, 401, { error: 'Sessão inválida ou expirada.' });
    const user = await userResponse.json();

    const requestedId = String(req.body?.item_id || '').trim().toLowerCase();
    const aliases = { 'script-whatsapp': 'whatsapp', 'whatsapp-script': 'whatsapp' };
    const itemId = aliases[requestedId] || requestedId;
    const item = ITEM_CATALOG[itemId];
    if (!item) return send(res, 400, { error: 'Este item ainda não está habilitado para pagamento.' });

    const siteUrl = 'https://miv-ecosystem.vercel.app';
    const preference = {
      items: [{
        id: itemId,
        title: item.title,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: item.unit_price
      }],
      payer: user.email ? { email: user.email } : undefined,
      external_reference: `${user.id}|${item.item_type}|${itemId}`,
      metadata: {
        miv_user_id: user.id,
        miv_item_id: itemId,
        miv_item_type: item.item_type
      },
      back_urls: {
        success: `${siteUrl}/?payment=success#central`,
        pending: `${siteUrl}/?payment=pending#central`,
        failure: `${siteUrl}/?payment=failure#central`
      },
      auto_return: 'approved',
      notification_url: `${siteUrl}/api/mercadopago/webhook`,
      statement_descriptor: 'MIV ECOSYSTEM'
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mpToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    });
    const mpData = await mpResponse.json();
    if (!mpResponse.ok) {
      console.error('[MIV Mercado Pago preference]', mpData);
      return send(res, 502, { error: 'Mercado Pago não criou o checkout.', details: mpData?.message || null });
    }

    // Com credencial de teste, priorizamos sandbox_init_point.
    const checkoutUrl = mpData.sandbox_init_point || mpData.init_point;
    if (!checkoutUrl) return send(res, 502, { error: 'Checkout criado sem URL de pagamento.' });

    return send(res, 200, {
      preference_id: mpData.id,
      checkout_url: checkoutUrl,
      item_id: itemId,
      amount: item.unit_price
    });
  } catch (err) {
    console.error('[MIV Mercado Pago]', err);
    return send(res, 500, { error: 'Não foi possível iniciar o pagamento.' });
  }
};
