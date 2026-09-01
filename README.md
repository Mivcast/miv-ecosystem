# MIV Ecosystem V13.17 — Webhook + liberação automática

Baseada na V13.16.

## O que entrou nesta versão
- Endpoint `GET/POST /api/mercadopago/webhook`.
- Validação da assinatura `x-signature` do Mercado Pago via HMAC-SHA256.
- Consulta server-side do pagamento em `GET /v1/payments/{id}`.
- Só libera conteúdo quando o pagamento está `approved`.
- Valida usuário, item e valor no servidor.
- Grava/upserta `user_purchases` com a `SUPABASE_SECRET_KEY` somente no backend.
- Repetições do mesmo Webhook são idempotentes graças à chave única `(user_id,item_type,item_id)`.
- A preferência de compra agora também informa `notification_url` explicitamente.
- `GET /api/mercadopago/webhook` funciona como health-check e não libera nada.

## Variáveis Vercel necessárias
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`

## Teste do Webhook
No Mercado Pago Developers > Webhooks > Modo de teste:
1. URL: `https://miv-ecosystem.vercel.app/api/mercadopago/webhook`
2. Evento: `Pagamentos (legacy)`
3. Salvar e gerar a assinatura secreta.
4. Usar `Simular notificação`.

O simulador pode usar um Data ID que não corresponde a um pagamento real. Nesse caso a rota deve responder HTTP 200 após validar a assinatura, mas não libera conteúdo. Para liberar de fato, o ID consultado precisa corresponder a um pagamento `approved` criado pela preferência da MIV.

## Segurança
Nenhuma chave secreta foi incluída nos arquivos. `SUPABASE_SECRET_KEY`, `MERCADOPAGO_ACCESS_TOKEN` e `MERCADOPAGO_WEBHOOK_SECRET` devem existir apenas nas Environment Variables da Vercel.

## V13.18 — Cupons V1
1. Execute `SUPABASE_V13_18_CUPONS.sql` no SQL Editor do projeto MIV Ecosystem.
2. Admin > Cupons permite criar percentual, valor fixo, limitar item/usos/validade e ativar/desativar.
3. O paywall aceita cupom. Desconto é validado/calculado no backend.
4. Cupom 100% libera sem Mercado Pago e registra a utilização.
5. Pagamentos com desconto levam o valor final no metadata; o webhook confere o valor e registra a utilização.

## V13.19 — Cupom com prévia
- Botão Aplicar no paywall.
- Validação segura em `/api/validate-coupon`.
- Exibe preço original, desconto e total antes de abrir Mercado Pago.
- O checkout continua recalculando o cupom no backend; a prévia não é fonte de verdade do preço.
