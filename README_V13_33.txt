MIV Ecosystem V13.33 — ATIVAÇÃO AUTOMÁTICA PÓS-PAGAMENTO

Objetivo
- Eliminar a necessidade de o administrador clicar em Atualizar após uma assinatura ser aprovada.

Mudanças
1. Novo endpoint /api/sync-my-subscription
   - autenticado pelo usuário;
   - consulta apenas assinaturas Mercado Pago pertencentes ao próprio usuário;
   - consulta o preapproval real no Mercado Pago;
   - converte authorized -> active, pending -> pending, paused -> past_due, canceled/cancelled -> canceled;
   - atualiza user_subscriptions no Supabase com service key somente no servidor.
2. Retorno do Mercado Pago (?subscription=return)
   - mostra “Confirmando sua assinatura…”;
   - sincroniza automaticamente;
   - ao confirmar, mostra “PRO/Premium liberado ✓”.
3. Minha Central
   - faz reconciliação automática em segundo plano ao abrir;
   - se houver pending, a sessão autenticada também tenta confirmar automaticamente.
4. Webhook existente permanece como primeira camada automática.
5. Botão Atualizar do Admin permanece como contingência/reconciliação manual.

Não requer SQL novo.
Não altera webhook secret, Access Token, compras avulsas, cupons ou MARK.IA.
