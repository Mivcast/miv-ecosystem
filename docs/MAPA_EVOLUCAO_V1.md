# Nova versao: Mapa de Evolucao Empresarial

Base preservada: commit `9b22b91`, tag `checkpoint/antes-mapa-evolucao-2026-10-17`.
Nova versao isolada na branch `version/mapa-evolucao-2026-10-17`.

## Escopo

- Menu e chamada inicial conforme o mapa enviado pelo usuario.
- Quatro pilares na mesma linha no desktop.
- Analises empresariais imediatamente depois dos pilares.
- Quatro etapas, 20 cards e 60 perguntas do documento, com Sim / Nao tenho certeza / Nao.
- Orientacao por ponto, anotacoes, favoritos locais, contexto para o MARK existente.
- Relatorio resumido ou detalhado com impressao A4 / salvar como PDF pelo navegador.
- Comecar analise completa abre as mesmas 60 perguntas, agrupadas nas quatro etapas. Respostas dos cards e do formulario usam a mesma persistencia. O relatorio completo e liberado ao responder todos os pontos; as regras PRO/Premium da analise completa existente foram mantidas.
- Dossie Premium passa a ser um card de Ferramentas. O formulario existente abre em dialogo, mantendo geracao, compra avulsa, exportacao e personalizacao anteriores. A visualizacao do formulario e livre; gerar continua exigindo Premium ou compra avulsa.
- Progresso de preenchimento separado da pontuacao de estrutura avaliada.
- Nichos compactos com escolha do subnicho em dialogo.
- Movimentos dos canais ocultos ate a pesquisa solicitada pelo usuario.
- Demais secoes, precos, pagamentos e APIs existentes preservados.

## Persistencia e limites

O novo mapa salva as respostas e anotacoes neste navegador. As chaves separam visitante/usuario, empresa e nicho. Nao houve migracao ou inclusao de tabelas: o novo mapa ainda nao sincroniza entre dispositivos ou com os relatorios da Central. O relatorio pode ser reaberto pelo botao Meu relatorio na secao.

As solucoes iniciais usam as orientacoes do documento e a resposta selecionada. Perguntar ao MARK abre o assistente existente com pergunta, nicho, resposta e anotacao, para aprofundamento pelas regras de acesso atuais. Nao simula uma resposta de IA.

A pesquisa de movimentos continua usando `/api/mark-ai` e as permissoes PRO/Premium existentes. Os testes locais usam uma resposta de pesquisa simulada; nao comprovam a qualidade de uma busca real em producao. Respostas de uma pesquisa que terminou depois da troca de nicho sao descartadas.

## Verificacao

Ajuste visual posterior: cinco cards por linha em cada etapa no desktop, fotos individuais locais, status no canto superior, indicadores circulares de resposta e pontuacao da etapa em destaque. Tablets e celulares usam duas ou uma coluna. A secao Recomendado para voce foi removida; a busca por necessidade mostra seus resultados no proprio formulario.

Checagem de sintaxe de app.js, evolution.js e evolution-data.js.
Teste Playwright em `tests/evolution.browser.cjs`: renderizacao das 60 perguntas, persistencia apos recarregar, isolamento por nicho, anotacoes escapadas, explicacao e solucao, modos de relatorio, impressao, contexto do MARK e pesquisa por canal sob demanda. Larguras: 1440, 1100, 768, 390 e 320 pixels.

O PDF de teste detalhado contem 60 orientacoes, inclui a ultima pergunta e nao possui paginas vazias. Capturas e PDF de verificacao ficam fora do repositorio, na pasta outputs/evolution-qa do workspace desta conversa.

## Comparacao e retorno

A branch main continua no commit anterior. Nenhum push ou deploy e feito nesta etapa.
Para retornar ao layout anterior depois de salvar todas as alteracoes desta versao:

```powershell
git switch main
```

Para voltar a nova versao:

```powershell
git switch version/mapa-evolucao-2026-10-17
```

O arquivo preexistente e nao rastreado `index_miv_ecosystem_jornada.html` foi preservado e nao integra este commit.
