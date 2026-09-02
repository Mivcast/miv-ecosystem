MIV Ecosystem V13.28 — Assinaturas PRO/Premium

1. Execute SUPABASE_V13_28_ASSINATURAS.sql.
2. Publique a versão na Vercel.
3. No Admin > Assinaturas, defina o preço mensal em centavos para PRO e Premium.
4. O frontend só inicia assinatura quando o preço for > 0.
5. /api/create-subscription cria uma assinatura Mercado Pago via /preapproval com preço vindo do Supabase.
6. /api/cancel-subscription cancela a assinatura do usuário autenticado.
7. O webhook V13.28 passa a reconhecer subscription_preapproval e sincroniza status com user_subscriptions.
8. Compra avulsa, cupom, MARK.IA, análises, calendário e Aprenda & Aplique permanecem preservados.

Observação: no painel Mercado Pago, habilite também o evento Webhook de Planos e assinaturas / subscription_preapproval para produção/testes de recorrência.
