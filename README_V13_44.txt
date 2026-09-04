MIV Ecosystem V13.44 - Erro controlado de assinatura sandbox

Objetivo:
- Evitar que o cliente veja a mensagem crua do Mercado Pago quando a assinatura mistura conta real e conta teste.

Alteracoes:
- `/api/create-subscription` agora bloqueia token `TEST-` sem `MERCADOPAGO_TEST_PAYER_EMAIL`.
- A mensagem "Both payer and collector must be real or test users" foi traduzida para uma orientacao clara em portugues.
- Com token de teste, a resposta passa a preferir `sandbox_init_point`.

Configuracao correta para teste:
- `MERCADOPAGO_ACCESS_TOKEN`: token do vendedor teste.
- `MERCADOPAGO_TEST_PAYER_EMAIL`: e-mail do comprador teste.
- Vendedor e comprador precisam ser usuarios de teste diferentes no Mercado Pago.

Teste recomendado:
1. Reimplantar a branch na Vercel.
2. Tentar assinar Pro com usuario logado no MIV Ecosystem.
3. Se aparecer a orientacao de ambiente misto, ajustar as credenciais de teste no Mercado Pago/Vercel.
4. Repetir o checkout e confirmar que a assinatura fica pendente ate o pagamento ser aprovado.
