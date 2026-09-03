MIV ECOSYSTEM — V13.31 — ATUALIZAR + SINCRONIZAR ASSINATURAS

Objetivo
- Corrigir o botão Atualizar do Admin.
- Sincronizar o status real das assinaturas recorrentes diretamente com o Mercado Pago, sem criar nova cobrança.

Alterações
1. Novo endpoint server-only: /api/sync-subscriptions.js
   - exige usuário autenticado com role=admin;
   - lê assinaturas Mercado Pago já salvas no Supabase;
   - consulta /preapproval/{id} usando MERCADOPAGO_ACCESS_TOKEN somente no servidor;
   - converte authorized -> active, pending -> pending, paused -> past_due, cancelled/canceled -> canceled;
   - atualiza next_payment_date e demais dados disponíveis.
2. Botão Atualizar do admin agora:
   - mostra “Atualizando…”;
   - chama a sincronização;
   - recarrega dados do Admin e preços dos planos;
   - mostra “Atualizado ✓” ao concluir.

Não alterado
- Webhook e assinatura secreta.
- Checkout avulso e cupons.
- Criação de assinatura/test payer da V13.30.
- MARK.IA, calendário, análises e catálogo.
- Banco/SQL: nenhuma migration nova necessária.

Teste
1. Deploy desta versão na Vercel.
2. Abrir /admin.html e entrar como admin.
3. Ir em Planos.
4. Clicar Atualizar.
5. A assinatura já aprovada no Mercado Pago deve mudar de pending para active se o preapproval correspondente estiver authorized.
