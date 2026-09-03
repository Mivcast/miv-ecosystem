MIV Ecosystem V13.37.3 — correção do guard de ambiente

Correção pontual em api/create-subscription.js:
- inicializa payEnv antes do uso;
- valida MIV_PAYMENT_MODE contra o tipo do token Mercado Pago;
- mantém as mesmas 12 funções /api da V13.36;
- nenhum SQL novo.

Configuração de teste esperada:
MIV_PAYMENT_MODE=test
MIV_SITE_URL=https://miv-ecosystem.vercel.app
