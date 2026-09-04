# Project Status - MIV Ecosystem

Data da ultima auditoria local: 2026-09-04.

## Versao

- Repositorio oficial: `https://github.com/Mivcast/miv-ecosystem`
- Branch auditada: `main`
- Commit base antes dos ajustes: `025553cd4585f91a8e6542e144bcc2bbeed44e5d`
- Checkpoint local criado: `checkpoint/pre-launch-20260904-antes-ajustes`
- Versao documentada no repo: V13.38

## Producao observada

Em 2026-09-04, a producao em `https://miv-ecosystem.vercel.app/` carregava arquivos diferentes do commit atual:

- `index.html`: hash diferente do local.
- `app.js`: hash diferente do local.
- `styles.css`: hash diferente do local.
- HTML publicado referenciava `app.js?v=13.26`.
- Webhook publicado respondia `version: "13.36"`.

Conclusao: GitHub `main` esta mais recente que a producao observada, ou a producao nao foi redeployada a partir do HEAD atual.

## Estado geral

Implementado no codigo:

- Vitrine principal.
- Temas por nicho.
- Login/cadastro/recuperacao via Supabase.
- Minha Central.
- Favoritos, historico, progresso e relatorios.
- Catalogo dinamico pelo Supabase.
- Admin restrito.
- Mercado Pago para compra avulsa e assinatura.
- Webhook Mercado Pago com assinatura.
- MARK.IA com Gemini via backend.
- Analises com IA protegidas por plano.
- Calendario de marketing com datas e IA paga.

Nao comprovado ponta a ponta nesta sessao:

- Compra real ou sandbox autenticada.
- Webhook `payment` aprovado atualizando o banco.
- Assinatura aprovada atualizando plano.
- RLS completa via usuario autenticado.
- Gemini em ambiente real.
- Admin com usuario admin real.

## Bloqueadores atuais

Criticos:

- Validar Mercado Pago ponta a ponta.
- Confirmar deploy da V13.38+.
- Confirmar variaveis Vercel em Production.
- Confirmar schema/RLS real no Supabase.

Altos:

- Resolver divergencias de catalogo entre fallback JS e banco.
- Validar `subscription_plans`, `learning_content` e `learning_tracks` com usuario correto.
- Testar Central durante sincronizacao de plano.

Medios:

- Consolidar READMEs historicos.
- Revisar copy de provas/resultados antes do lancamento.
- Confirmar precos de servicos MivCast com o proprietario.
