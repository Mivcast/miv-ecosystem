MIV Ecosystem V13.47 — preços padrão de assinatura

O que mudou
- PRO e Premium têm preços padrão fixos: R$ 47,90 e R$ 97,90.
- A vitrine, a API de assinatura e o gerenciamento de downgrade deixam de bloquear quando `subscription_plans` está vazio ou com preço 0.
- O Admin mostra os preços padrão e salva valores válidos em centavos.
- O script `SUPABASE_V13_47_PLAN_DEFAULT_PRICES.sql` corrige bases existentes sem sobrescrever preços positivos já configurados.

Como usar
1. Fazer deploy desta versão.
2. Opcionalmente rodar `SUPABASE_V13_47_PLAN_DEFAULT_PRICES.sql` no Supabase para deixar o banco coerente.
3. No Admin > Planos, mudar os preços apenas quando quiser sobrescrever o padrão.

Observação sobre Pix
- O app não bloqueia Pix por código na criação de assinatura.
- Se o checkout recorrente do Mercado Pago exibir somente cartão/conta Mercado Pago, isso vem do comportamento do provedor para assinatura recorrente.
- Para aceitar Pix como alternativa de venda, o caminho mais seguro é criar um fluxo separado de pagamento avulso/30 dias com liberação por período, em vez de forçar Pix dentro da assinatura recorrente.
