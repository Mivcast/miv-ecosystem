# Responsividade e release - 20/10/2026

## Mudancas

- Cards mobile dimensionados por porcentagem da largura util do carrossel, em vez de larguras fixas ou medidas de viewport que ignoravam as margens.
- Estantes, quatro etapas, depoimentos e carrosseis da Central com 84% de largura por item, espaco para o proximo card, scroll nativo e snap suave. Trilhas com um unico item ocupam toda a largura.
- Conteudo das etapas continua completo e acessivel dentro de cada card; no desktop permanecem cinco cards por linha.
- Titulos, botoes, filtros e modais respeitam a largura disponivel. Titulos das secoes podem quebrar junto aos controles de navegacao.
- Cards nao animam mais a largura ao mudar a orientacao do aparelho.
- Sem alteracao de precos, regras de acesso, APIs, banco de dados ou protecao dos arquivos privados.

## Testes

- mobile-layout.browser.cjs: larguras 320, 360, 390, 430, 700 e 768; limites reais das secoes, titulos e campos; card inteiro; parte do proximo item visivel; scroll funcional. Central em 320, 390 e 700 com favoritos, historico, recomendacoes e relatorios de teste.
- diagnosis-access.browser.cjs: acesso, cortesia, fluxo completo, relatorios, isolamento entre contas e modais mobile.
- evolution.browser.cjs: vinte cards, sessenta perguntas, persistencia, notas, relatorios, impressao, contextos e desktop/mobile.
- 26 testes Node para APIs, regras comerciais, isolamento do build e roteamento.
- Screenshots ignorados pelo Git em outputs/mobile-layout/ e outputs/experience-qa/.

## Publicacao

Publicacao em producao autorizada explicitamente pelo usuario neste turno. Preparar build de producao sem trocar dominio, executar smoke de seguranca e promover apenas o build aprovado.

Rollback anterior: dpl_Fc8PkaUqYhEMrEaB23t5Jb7ua2Yi, commit 24d85449832aaaaa7c573137d39fece0c63bb9f8.

Publicacao e smoke HTTP nao substituem homologacao real de cadastro, acesso entre dispositivos e checkout/webhook em sandbox, que continuam pendencias comerciais registradas na auditoria anterior.
