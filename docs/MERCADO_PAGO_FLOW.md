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

## Ajuste V13.39

- Webhook de compra avulsa valida `item_id` contra `ecosystem_cards` ativo no Supabase, com fallback apenas para o card historico `whatsapp`.
- Preferencia usa o host da requisicao em `back_urls` e `notification_url`, permitindo testar Preview sem redirecionar para producao.
- `user_subscriptions.status` deve aceitar `pending`, pois o backend grava esse status ao criar uma assinatura antes da aprovacao do Mercado Pago.

## Ajuste V13.41

- Em sandbox, compra avulsa tambem respeita `MERCADOPAGO_TEST_PAYER_EMAIL` quando o token comeca com `TEST-`.
- Em producao, o payer continua sendo o e-mail real do usuario autenticado.

## Ajuste V13.42

- Webhook aceita variacoes seguras do ID assinado pelo Mercado Pago: `data.id` na URL, `id` legado, `data.id` no body e evento sem ID assinado.
- Assinatura invalida continua retornando 401 e nao libera compra.
- Retorno `payment=success` agora chama `/api/create-mercadopago-preference` com `action: "sync_purchase"` e usuario autenticado.
- Essa sincronizacao consulta o pagamento direto no Mercado Pago e so grava `user_purchases` quando status, usuario, item e valor batem com os metadados do checkout.
- Cadastro passa `emailRedirectTo: location.origin` para novos e-mails de confirmacao abrirem no dominio atual.

## Ajuste V13.44

- Criacao de assinatura com token `TEST-` exige `MERCADOPAGO_TEST_PAYER_EMAIL` configurado.
- Quando o Mercado Pago responde que comprador e vendedor precisam ser ambos reais ou ambos teste, a API retorna orientacao em portugues para corrigir as credenciais.
- Em token de teste, a assinatura prefere `sandbox_init_point` antes de `init_point`.
- Para testar assinaturas no sandbox, use um Access Token de vendedor teste e um e-mail de comprador teste diferente do vendedor.

## Ajuste V13.45

- Cada card pago de plano (Pro e Premium) agora tem seu proprio campo de cupom opcional.
- Cupons de plano reutilizam a tabela `coupons`; `item_id` vazio vale para todos, `pro` vale para Pro e `premium` vale para Premium.
- A assinatura aplica qualquer desconto valido antes de criar o checkout no Mercado Pago, entao o valor enviado ao provedor ja sai reduzido.
- Como o Mercado Pago recebe esse valor no `auto_recurring.transaction_amount`, o desconto fica recorrente naquela assinatura criada.
- Se um desconto deixar a mensalidade zerada ou abaixo do minimo tecnico, a API envia R$ 1,00 para manter o checkout recorrente aceito pelo Mercado Pago.
- Cupons de 50%, 99%, 100% ou valor fixo podem ser criados/desativados no Admin conforme a campanha.

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
