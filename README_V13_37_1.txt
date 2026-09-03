MIV ECOSYSTEM V13.37.1 — CORREÇÃO DE DEPLOY VERCEL HOBBY

Correção estrutural da V13.37 para manter o projeto dentro do limite de funções Serverless do plano Hobby.

ALTERAÇÕES
- Helper de ambiente de pagamento movido de /api/_payment-env.js para /lib/payment-env.js.
- Imports dos endpoints de checkout/assinatura atualizados para o novo local.
- Endpoint temporário /api/payment-environment removido para não consumir uma função Serverless adicional.
- Proteções TESTE/PRODUÇÃO da V13.37 foram mantidas nos endpoints de pagamento.
- Nenhuma alteração em banco de dados.
- Nenhuma alteração nas chaves/segredos existentes.

VARIÁVEIS MANTIDAS
MIV_PAYMENT_MODE=test
MIV_SITE_URL=https://miv-ecosystem.vercel.app

VALIDAÇÃO
Após o deploy, confirmar que o deployment fica Ready. A validação do ambiente será feita sem criar uma rota Serverless exclusiva.
