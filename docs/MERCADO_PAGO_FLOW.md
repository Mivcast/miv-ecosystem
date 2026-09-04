# Mercado Pago Flow

## Compra avulsa

1. Usuario logado abre card pago.
2. Frontend chama `/api/validate-coupon` para previa opcional.
3. Frontend chama `/api/create-mercadopago-preference`.
4. Backend valida JWT Supabase.
5. Backend busca card ativo em `ecosystem_cards`; se necessario usa fallback controlado.
6. Backend recalcula cupom e valor.
7. Backend cria preferencia no Mercado Pago.
8. Preferencia inclui metadata e `external_reference`.
9. Usuario paga no checkout Mercado Pago.
10. Mercado Pago chama `/api/mercadopago/webhook`.
11. Webhook valida `x-signature`.
12. Webhook consulta pagamento na API Mercado Pago.
13. Apenas pagamento `approved` grava `user_purchases`.
14. Central recarrega acessos via Supabase.

## Assinatura

1. Usuario escolhe Pro ou Premium.
2. Frontend chama `/api/create-subscription`.
3. Backend valida JWT.
4. Backend busca `subscription_plans`.
5. Backend cria `preapproval` no Mercado Pago.
6. Backend grava assinatura `pending`.
7. Usuario retorna com `?subscription=return`.
8. Frontend chama `/api/sync-my-subscription`.
9. Webhook tambem pode atualizar `user_subscriptions`.
10. Plano ativo libera recursos Pro/Premium.

## Seguranca obrigatoria

- Frontend nunca declara pagamento aprovado sozinho.
- Webhook deve validar assinatura.
- Backend deve consultar a API Mercado Pago.
- Valor pago deve bater com valor esperado.
- Liberacao deve ser idempotente.
- `MERCADOPAGO_TEST_PAYER_EMAIL` so pode operar com token `TEST-`.

## Testes pendentes

- Pagamento aprovado.
- Pagamento pendente.
- Pagamento rejeitado.
- Webhook duplicado.
- Cupom 100%.
- Cupom com desconto.
- Assinatura Pro.
- Upgrade Pro para Premium.
- Cancelamento e downgrade.
