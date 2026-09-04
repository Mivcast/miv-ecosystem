MIV Ecosystem V13.43 - Estado de assinatura pendente na Central

Objetivo:
- Evitar que a Minha Central mostre "Gratis" quando existe assinatura em processamento ou com pagamento pendente.

Alteracoes:
- A Central agora carrega assinaturas `active`, `pending` e `past_due`.
- Assinatura `pending` aparece como "Processando" e nao libera recursos Pro.
- Assinatura `past_due` aparece como "Pagamento pendente" e tambem nao libera recursos Pro.
- O acesso pago continua dependendo exclusivamente de assinatura `active` valida.

Teste recomendado:
1. Criar uma assinatura sandbox e gerar boleto sem pagar.
2. Voltar para a Central.
3. Confirmar que aparece estado de processamento ou pendencia, sem liberar Pro.
