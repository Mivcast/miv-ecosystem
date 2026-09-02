MIV Ecosystem V13.22 — Correção/diagnóstico da assinatura do Webhook Mercado Pago

Alteração focada em api/mercadopago/webhook.js:
- leitura de data.id diretamente da URL bruta com WHATWG URL;
- fallback para req.query['data.id'] e data_id;
- trim da MERCADOPAGO_WEBHOOK_SECRET para evitar espaços/quebras de linha ao colar na Vercel;
- mantém o manifest oficial: id:<data.id>;request-id:<x-request-id>;ts:<ts>;
- diagnóstico seguro no log quando houver signature_mismatch (sem exibir segredo/assinatura);
- health check atualizado para version 13.22.

Nenhuma regra de preço, compra, cupom, acesso, Supabase ou frontend foi alterada.

Depois do deploy, teste GET:
https://miv-ecosystem.vercel.app/api/mercadopago/webhook
Deve retornar version 13.22.

Se um novo webhook ainda retornar signature_mismatch, confira no log os campos:
hasDataId=true, hasRequestId=true, hasTimestamp=true.
Se estiverem true, a causa restante mais provável é MERCADOPAGO_WEBHOOK_SECRET não corresponder à chave secreta atual da configuração Webhooks da aplicação; nesse caso, redefina/copiei a chave no Mercado Pago, atualize a variável na Vercel e faça Redeploy.
