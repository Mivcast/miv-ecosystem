MIV ECOSYSTEM — V13.30 — ASSINATURA TEST PAYER

Objetivo
- Corrigir o teste de assinaturas recorrentes do Mercado Pago quando o collector usa credenciais de teste e o usuário do MIV Ecosystem possui e-mail real.

Alteração
- /api/create-subscription.js agora aceita a variável de ambiente:
  MERCADOPAGO_TEST_PAYER_EMAIL
- Quando ela estiver preenchida, esse e-mail é usado como payer_email na criação da preapproval do Mercado Pago.
- Quando estiver ausente/vazia, o sistema continua usando o e-mail real do usuário autenticado no MIV Ecosystem.

Configuração para o teste atual na Vercel
Nome: MERCADOPAGO_TEST_PAYER_EMAIL
Valor: test_user_6454138231057478231@testuser.com

IMPORTANTE PARA PRODUÇÃO
- Ao trocar MERCADOPAGO_ACCESS_TOKEN para credencial de produção, remova MERCADOPAGO_TEST_PAYER_EMAIL do ambiente de produção ou deixe-a vazia.
- Assim o payer_email volta automaticamente a ser o e-mail real do cliente.

Não alterado nesta versão
- Checkout avulso
- Cupons
- Webhook de pagamentos/assinaturas
- Supabase / SQL
- MARK.IA
- Catálogo
- Valores dos planos

Teste esperado
1. Fazer deploy da V13.30.
2. Configurar MERCADOPAGO_TEST_PAYER_EMAIL na Vercel no mesmo ambiente do deploy.
3. Fazer novo deploy/redeploy após salvar a variável.
4. Na janela anônima, permanecer logado no Buyer Test User do Mercado Pago.
5. Abrir o MIV Ecosystem, entrar na conta do MIV e clicar em Quero acesso Pro.
6. Confirmar R$ 47,90/mês.
7. O Mercado Pago deve criar a assinatura e abrir o init_point sem o erro "Both payer and collector must be real or test users".
