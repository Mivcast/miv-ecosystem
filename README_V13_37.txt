MIV ECOSYSTEM — V13.37 — AMBIENTES DE PAGAMENTO SEGUROS

Objetivo
Separar com segurança o Mercado Pago de TESTE e PRODUÇÃO antes do lançamento, sem alterar banco de dados nem exigir uma nova compra agora.

O que mudou
1. Nova variável opcional MIV_PAYMENT_MODE:
   - test = exige credencial TEST-...
   - production = rejeita credencial TEST-...
   - auto/ausente = detecta pela credencial, mantendo compatibilidade com a V13.36

2. Nova variável opcional MIV_SITE_URL:
   - centraliza a URL pública usada nos retornos do checkout e webhook de compras avulsas.
   - recomendação atual: https://miv-ecosystem.vercel.app

3. Proteção contra mistura de ambientes:
   - se MIV_PAYMENT_MODE=production e o token for TEST, o checkout é bloqueado antes de cobrar.
   - se MIV_PAYMENT_MODE=test e o token parecer produtivo, o checkout também é bloqueado.

4. MERCADOPAGO_TEST_PAYER_EMAIL continua funcionando SOMENTE em ambiente de teste.
   Em produção, o e-mail real da conta MIV é usado.

5. Checkout URL correta por ambiente:
   - teste prioriza sandbox_init_point
   - produção usa init_point

6. Endpoint seguro de diagnóstico:
   GET /api/payment-environment
   Mostra apenas modo/configuração (nunca tokens ou secrets).

NÃO HÁ SQL NOVO.

CONFIGURAÇÃO RECOMENDADA AGORA (enquanto ainda testamos)
MIV_PAYMENT_MODE=test
MIV_SITE_URL=https://miv-ecosystem.vercel.app
MERCADOPAGO_TEST_PAYER_EMAIL=<buyer de teste já configurado>
MERCADOPAGO_ACCESS_TOKEN=<token TEST atual>
MERCADOPAGO_WEBHOOK_SECRET=<secret do webhook de teste atual>

QUANDO FOR LANÇAR EM PRODUÇÃO
1. Trocar MERCADOPAGO_ACCESS_TOKEN pela credencial produtiva.
2. Trocar MERCADOPAGO_WEBHOOK_SECRET pelo secret do webhook produtivo correspondente.
3. Definir MIV_PAYMENT_MODE=production.
4. Manter MIV_SITE_URL com o domínio oficial.
5. Remover ou deixar vazia MERCADOPAGO_TEST_PAYER_EMAIL.
6. Fazer uma compra real controlada de baixo valor e uma assinatura real controlada antes de abrir ao público.

IMPORTANTE
Não colocar Access Token, Webhook Secret, Supabase Secret ou Gemini Key no frontend/GitHub.
