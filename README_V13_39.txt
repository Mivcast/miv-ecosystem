MIV Ecosystem V13.39 — Correcoes minimas do fluxo de venda real

Objetivo:
- Remover bloqueadores tecnicos para validar compra avulsa e assinatura em Preview/Producao.

Alteracoes:
1. api/mercadopago/webhook.js
   - compra avulsa agora valida o item pago contra ecosystem_cards no Supabase;
   - fallback historico mantido apenas para whatsapp;
   - pagamento aprovado de qualquer card ativo com price_cents pode registrar user_purchases.

2. api/create-mercadopago-preference.js
   - back_urls e notification_url usam o host real da requisicao;
   - Preview da Vercel pode ser testado sem redirecionar para producao.

3. SUPABASE_V13_39_STATUS_ASSINATURAS.sql
   - SQL nao destrutivo para permitir status pending em user_subscriptions;
   - necessario porque o backend grava pending antes da aprovacao do Mercado Pago.

Nada foi alterado em:
- precos;
- regras comerciais;
- credenciais;
- RLS;
- configuracao da Vercel;
- producao.

Testes locais:
- node --check em todas as APIs;
- git diff --check;
- mock de webhook payment approved para card oferta;
- mock de create-mercadopago-preference com host de Preview.
