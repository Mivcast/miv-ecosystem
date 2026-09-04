# Supabase Schema

Esta documentacao reflete as tabelas chamadas pelo codigo V13.38. Confirmar no painel Supabase antes de publicar.

## Catalogo e conteudo

- `ecosystem_categories`: categorias/shelves da vitrine.
- `ecosystem_cards`: cards exibidos na vitrine e no Admin.
- `learning_content`: conteudos dinamicos do Aprenda & Aplique.
- `learning_tracks`: trilhas dinamicas de aprendizado.

## Usuarios e empresas

- `companies`: empresa vinculada ao usuario.
- `company_users`: relacionamento usuario/empresa.
- `company_profiles`: contexto aprofundado da empresa.

## Central

- `user_favorites`: favoritos.
- `user_history`: historico de uso.
- `user_progress`: progresso de checklists/analises.
- `user_reports`: relatorios salvos.
- `marketing_calendar_profiles`: preferencias e datas do calendario.
- `marketing_calendar_saved_ideas`: ideias salvas do calendario.

## Monetizacao

- `subscription_plans`: configuracao dos planos Pro/Premium.
- `user_subscriptions`: assinaturas e status de plano.
- `user_purchases`: compras avulsas/liberacoes.
- `coupons`: cupons.
- `coupon_redemptions`: uso de cupons.
- `subscription_events`: eventos de assinatura.

## MARK.IA

- `mark_ai_settings`: configuracao global.
- `mark_ai_knowledge`: base de conhecimento privada.
- `mark_ai_area_instructions`: instrucoes por area.
- `mark_ai_card_instructions`: instrucoes por card.
- `mark_ai_usage`: franquia mensal de uso.

## RLS minima esperada

- Tabelas de usuario devem exigir `auth.uid() = user_id`.
- Tabelas de empresa devem exigir participacao em `company_users`.
- Tabelas administrativas devem exigir role admin segura, preferencialmente via dado nao editavel pelo usuario.
- Catalogo publico pode ser legivel por anon/auth, mas escrita deve ser admin.
- Chaves secretas devem ser usadas apenas nas funcoes Vercel.

## Riscos pendentes

- Confirmar grants e RLS no banco real.
- Confirmar se `subscription_plans`, `learning_content` e `learning_tracks` sao legiveis pelos papeis corretos.
- Confirmar isolamento entre usuarios autenticados.
