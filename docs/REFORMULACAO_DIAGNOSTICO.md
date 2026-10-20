# Reformulacao do diagnostico empresarial

Implementacao incremental conforme o documento fornecido em 19/10/2026.
Checkpoint anterior: `checkpoint/antes-reformulacao-diagnostico-2026-10-19`.

## Conteudo e interface

- `evolution-data.js` preserva a estrutura, imagens e dados originais de referencia.
- `diagnosis-official.js` contem as 60 perguntas e descricoes aprovadas, extraidas do documento como dados.
- `diagnosis-guidance.js` define 60 explicacoes, orientacoes, sequencias praticas, exemplos e vinculos contextuais. As perguntas usam IDs semanticos estaveis, independentes da redacao exibida.
- `evolution.js` apresenta as mesmas quatro etapas, 20 cards e tres perguntas por card, incluindo analise completa e relatorio.
- A opcao Nao se aplica e oferecida em questoes condicionais de ofertas adicionais e expansao. Exige justificativa. Conta como preenchida e fica fora do denominador da pontuacao; questoes sem resposta tambem nao entram na pontuacao.
- Uma pontuacao sem respostas aplicaveis permanece sem valor, nunca representa automaticamente 100%.
- A interface identifica o resultado como autoavaliacao declarada, sem certificacao ou auditoria comprovada.
- O MARK recebe a pergunta, seu ID, etapa, card, resposta, justificativa, observacoes digitadas, orientacao e contexto disponivel da empresa, usando o fluxo existente.

## Avaliacoes existentes

O armazenamento anterior `mivEvolution:v1` nao e apagado nem sobrescrito. A versao `mivEvolution:v2` tem as mesmas separacoes por usuario, empresa e nicho.

Na primeira leitura, apenas perguntas com correspondencia explicita de significado recebem a resposta e a anotacao anteriores. Perguntas novas, como analise da concorrencia, responsabilidades e provas de confianca, iniciam pendentes. A antiga pergunta sobre dependencia de uma unica fonte recebe inversao explicita de Sim/Nao porque a nova pergunta avalia diversificacao; incerteza continua incerteza.

O botao Ver avaliacao anterior abre respostas e anotacoes originais, inclusive dos pontos que nao foram migrados. IDs, mapeamentos e inversoes estao declarados no conteudo, em vez de inferidos pelo texto em tempo de execucao.

Os dados do novo mapa continuam locais ao navegador; esta atualizacao nao cria sincronizacao entre dispositivos ou novas tabelas.

## Biblioteca

`library-reform.js` consolida 10 cards de marketing/vendas e quatro de marca. A vitrine usa uma lista oficial para nao voltar a exibir duplicacoes quando o catalogo remoto e carregado. Titulos reformulados sao reaplicados sem mudar preco ou permissao.

Os registros de clientes-marketing, brindes e fidelizacao continuam existindo. Seus links abrem o sucessor followup, renomeado para Estrategias para fidelizar clientes e gerar recompra. Suas secoes uteis sao incorporadas ao sucessor. Pontos equivalentes compartilham o destino; itens avancados com IDs posicionais de fontes diferentes nunca sao confundidos.

As respostas dos checklists antigos sao lidas para as chaves correspondentes no consolidado, sem sobrescrever uma resposta ja registrada no destino. Os armazenamentos originais, historicos, favoritos e compras nao sao excluidos. Nenhum registro do banco foi apagado ou migrado nesta etapa.

WhatsApp conserva seu checklist e ganha modelos adaptaveis. Branding digital enfatiza reputacao, linguagem e coerencia da promessa, reservando configuracoes tecnicas ao guia de canais. A geracao do plano mensal usa as categorias consolidadas, evitando duplicar os antigos cards no dossie.

## Validacao

O teste Playwright cobre as 60 perguntas, os 60 modais de informacao e solucao, correspondencia dos exemplos e recursos, salvamento, relatorio, impressao, wizard completo, contexto do MARK e larguras desktop/mobile.

Casos adicionais: migracao compativel, nao reutilizacao de conceitos diferentes, inversao de polaridade, preservacao exata do armazenamento anterior, justificativa obrigatoria e exclusao de Nao se aplica da pontuacao, 14 cards visiveis, preservacao de permissoes, resolucao de links legados, conteudo fundido e recuperacao do checklist antigo.

Integracoes externas de pesquisa sao simuladas no teste; chamadas reais autenticadas do MARK, pagamentos e sincronizacao remota nao foram exercitadas nesta verificacao local. Nao houve publicacao em producao.
