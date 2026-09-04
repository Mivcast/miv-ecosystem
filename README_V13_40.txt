MIV Ecosystem V13.40 — Leitura publica segura dos planos ativos

Objetivo:
- Corrigir o erro "permission denied for function is_admin" ao carregar subscription_plans pelo frontend.

Alteracao:
- Novo SQL SUPABASE_V13_40_PLANOS_PUBLIC_READ.sql.
- A policy publica de subscription_plans passa a permitir SELECT de planos active = true sem chamar public.is_admin().
- A policy administrativa continua separada para usuarios autenticados admin.

Nada foi alterado em:
- precos;
- nomes dos planos;
- assinaturas existentes;
- credenciais;
- frontend;
- webhook;
- Mercado Pago.

Validacao esperada:
- GET anonimo em subscription_plans deve retornar Pro/Premium ativos.
- Admin ainda deve conseguir editar planos quando public.is_admin() for true.
