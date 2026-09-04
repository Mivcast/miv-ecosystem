MIV Ecosystem V13.41 — Payer de teste em compra avulsa sandbox

Objetivo:
- Evitar loop/redirecionamento incorreto no Checkout Pro sandbox quando o usuario logado no app usa um e-mail real ou ligado ao vendedor.

Alteracao:
- api/create-mercadopago-preference.js passa a aplicar a mesma regra ja usada em assinaturas:
  - se MERCADOPAGO_ACCESS_TOKEN comeca com TEST-;
  - e MERCADOPAGO_TEST_PAYER_EMAIL estiver configurado;
  - o payer.email enviado ao Mercado Pago usa o comprador de teste.

Seguranca:
- Com token de producao, MERCADOPAGO_TEST_PAYER_EMAIL e ignorado.
- O usuario real do Supabase continua indo em metadata e external_reference para liberar o item correto.
- Nenhum preco, cupom, plano, webhook ou banco foi alterado.

Teste esperado:
- Compra avulsa sandbox abre o checkout com comprador de teste.
- Cupom TESTE90 continua calculando o total em R$ 1,99 para o card WhatsApp.
