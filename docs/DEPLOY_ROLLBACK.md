# Deploy and Rollback

## Antes do deploy

1. Confirmar branch e commit.
2. Rodar `node --check app.js`.
3. Rodar `node --check` em todos os arquivos `api/**/*.js`.
4. Verificar que `.env.example` nao contem segredos.
5. Fazer Preview deploy.
6. Testar login, Central, paywall, APIs e Mercado Pago sandbox.

## Deploy de producao

Publicar em producao somente com autorizacao explicita do proprietario.

Registrar:

- commit publicado;
- horario;
- ambiente;
- variaveis alteradas;
- testes executados;
- responsavel pela aprovacao.

## Rollback

1. Identificar ultimo deployment estavel na Vercel.
2. Promover rollback pelo painel/CLI da Vercel.
3. Nao reverter banco automaticamente.
4. Se houver erro de pagamento/liberacao, pausar venda antes de mexer em dados.
5. Corrigir manualmente acessos afetados apenas com evidencia de pagamento.

## Observacao

Banco e deploy devem ter rollback separados. Alteracoes SQL destrutivas nao devem ser feitas sem backup e plano de retorno.
