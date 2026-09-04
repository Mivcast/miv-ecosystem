# MIV Ecosystem

Plataforma da MivCast Marketing Digital para reunir vitrine de estrategias, ferramentas, analises empresariais, conteudos, consultoria, servicos e MARK.IA.

Estado atual: **V13.38 - revisao de acessos e monetizacao**.

## Prioridade

O objetivo imediato e terminar o minimo necessario para lancamento real:

1. Venda real funcionando.
2. Pagamento confirmado automaticamente.
3. Plano ou card liberado pelo backend/Supabase.
4. Central refletindo o acesso correto.
5. Dados de usuario protegidos por autenticacao e RLS.

Evite reconstruir a aplicacao, redesenhar a interface ou ampliar escopo antes da venda real estar comprovada.

## Estrutura

- `index.html`: frontend principal.
- `styles.css`: identidade visual e responsividade.
- `app.js`: vitrine, Central, MARK.IA, calendario, analises e integracao Supabase no cliente.
- `admin.html`: painel administrativo restrito por conta admin.
- `api/`: funcoes serverless Vercel.
- `SUPABASE_*.sql`: historico de schema/migracoes manuais.
- `modules/`: documentacao modular de cards/areas.

## Documentacao operacional

- `PROJECT_STATUS.md`
- `LAUNCH_CHECKLIST.md`
- `AGENTS.md`
- `.env.example`
- `docs/SUPABASE_SCHEMA.md`
- `docs/MERCADO_PAGO_FLOW.md`
- `docs/PLANS_PERMISSIONS.md`
- `docs/CARDS_INVENTORY.md`
- `docs/DEPLOY_ROLLBACK.md`

## Variaveis de ambiente

Use `.env.example` como referencia. Nunca commitar valores reais de `SUPABASE_SECRET_KEY`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET` ou `GEMINI_API_KEY`.

## Deploy

O projeto publicado conhecido e:

https://miv-ecosystem.vercel.app/

Antes de publicar, comparar o commit local com a producao e validar pelo menos:

- home carrega;
- login/cadastro funcionam;
- Central nao mostra plano incorreto durante sincronizacao;
- card pago nao libera sem compra/plano;
- checkout sandbox cria preferencia;
- webhook `payment` aprovado registra `user_purchases`;
- assinatura aprovada registra `user_subscriptions`;
- MARK.IA e analises respeitam permissao.
