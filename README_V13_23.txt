MIV ECOSYSTEM V13.23 — CATÁLOGO DINÂMICO + ADMIN

1. Execute SUPABASE_V13_23_CATALOGO_DINAMICO.sql no SQL Editor do projeto MIV Ecosystem.
2. Publique esta versão na Vercel.
3. Abra /admin.html > Cards & Categorias.
4. Edite um card de teste (título, ordem, acesso, preço, ativo) e confirme na vitrine.

O frontend mantém fallback local caso o catálogo do Supabase esteja indisponível.
O backend de pagamento passa a usar price_cents do catálogo para itens com preço fixo, preservando fallback do card WhatsApp.
V13.22 permanece como rollback estável.
