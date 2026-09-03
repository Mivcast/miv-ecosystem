MIV Ecosystem V13.37.2 — correção conservadora de deploy

Base: V13.36 (última versão confirmada como publicável).

Mudanças:
- Mantém exatamente a mesma estrutura de arquivos e as mesmas 12 funções /api da V13.36.
- Não cria /lib e não cria endpoint de diagnóstico.
- A proteção TESTE/PRODUÇÃO foi incorporada diretamente apenas nos dois endpoints que iniciam cobrança.
- MIV_PAYMENT_MODE=test exige token TEST-.
- MIV_PAYMENT_MODE=production rejeita token TEST-.
- MIV_SITE_URL centraliza URLs de retorno/webhook.
- MERCADOPAGO_TEST_PAYER_EMAIL só substitui o e-mail do usuário em ambiente test.
- Sem SQL novo.
