# MIV Ecosystem V9 — Base estrutural

Esta versão preserva a V8 CORRIGIDA como base visual.

## Incluído
- Rodapé completo.
- Login, cadastro e recuperação de senha demonstrativos.
- `admin.html` separado e sem link na navegação pública.
- Dashboard admin com Cards, Categorias, Instruções/IA, Planos, Cupons, Usuários, Clientes, Estatísticas, Relatórios e Configurações.

## Segurança na versão real
O admin desta versão é apenas visual. Em produção: rota protegida por sessão, role admin, hash forte de senha, 2FA recomendado, logs/auditoria, rate limit, CSRF e redefinição de senha por token. O administrador nunca deve visualizar senhas atuais.

## Backend futuro — entidades principais
users, companies, company_profiles, niches, subniches, cards, card_categories, card_contents, card_ai_instructions, card_access_rules, plans, plan_permissions, coupons, subscriptions, purchases, favorites, card_events, analyses, reports, mark_conversations, mark_memories, notifications, waitlists e services.
