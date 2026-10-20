# Ajustes de experiencia - 20/10/2026

## Escopo

- Visao das quatro areas mais compacta, com tres beneficios por area.
- Cadastro com aviso contextual para solucoes e analise completa; respostas da autoavaliacao nos cards continuam gratuitas.
- Analise completa com as mesmas acoes de orientacao e solucao dos cards. Ao fechar uma orientacao, solucao ou bloqueio, retorna a etapa e posicao anteriores.
- Relatorio detalhado continua incluindo somente solucoes autorizadas pelo servidor. Responder ao questionario nao libera conteudo pago.
- Indicador "Solucao consultada" aparece somente depois de abrir a solucao autorizada. Persistido neste navegador, separado por conta, empresa e nicho. Nao representa permissao, conclusao da tarefa ou comprovacao de resultado.
- Desbloqueio apresenta cortesia, compra avulsa do card e comparacao de planos. Nenhuma mudanca nos precos ou regras; valores continuam vindos do servidor.
- Sete imagens PNG com transparencia real, reutilizadas por familia nos vinte servicos. Links e cadastro dos servicos preservados.

## Verificacao

- 26 testes Node: regras administrativas, API, autorizacao, checkout/webhook simulados, build publico e roteamento.
- diagnosis-access.browser.cjs: aviso e cadastro em 320px, bloqueio do wizard para visitante, duas cortesias vitalicias, reabertura, indicador persistente, retorno ao wizard, relatorio sem vazamento de solucoes, Pro/Premium, rascunho offline, isolamento entre contas, sete imagens com alpha real e layouts 1440/390/320.
- evolution.browser.cjs: vinte cards, sessenta perguntas, escopo por nicho, justificativas, notas, relatorio/PDF e layouts 2048/1440/1100/768/390/320.
- admin-commerce.browser.cjs: precos, franquias, regras, falha de rede e layouts 1440/768/390.
- Screenshots locais: outputs/experience-qa/ (ignorados pelo Git).
- Integracoes dos testes de navegador sao simuladas. Nao houve cobranca real nem escrita no banco de producao nesta alteracao.

## Lancamento

Esta alteracao esta local; nao foi publicada em producao. A producao anterior nao foi alterada.

Antes de recomendar vendas, executar com ambiente e contas de teste autorizados:

1. Cadastro/confirmacao de email, login e recuperacao reais.
2. Salvar analise e relatorio na Central, sair e recuperar em outra sessao/dispositivo.
3. Checkout avulso e assinatura em sandbox, retorno e webhook assinado, incluindo pendente/recusado, duplicacao, cancelamento e verificacao de acessos.
4. Confirmar plano de hospedagem compativel com operacao comercial, configuracao do pagamento de producao e consumo/limites de IA.
5. Publicar a versao revisada e repetir o smoke de seguranca na URL oficial.

Nao considerar testes simulados como comprovacao dessas etapas reais.

## Assets e prompts

Gerados com a ferramenta integrada image_gen, transparent_background=true. Originais preservados em CODEX_HOME/generated_images; copias usadas pelo projeto em assets/services/.

Todos os prompts usam product-mockup, fotografia de produto com iluminacao de estudio, composicao horizontal centralizada, objetos inteiros, margens transparentes, alpha real e sem mesa, ambiente, pessoas ou marca d'agua.

- website.png: notebook prateado aberto mostrando site empresarial branco e azul, com foto e botao de contato.
- branding.png: kit de identidade com manual de marca, cartoes, amostras de cores e caneta, azul/teal/branco.
- commerce.png: notebook com grade de produtos e carrinho de ecommerce, acompanhado de caixa de envio.
- social.png: smartphone com perfil profissional de rede social e mockups de posts, azul/teal/coral.
- local.png: smartphone com mapa, pin e perfil de empresa, acompanhado de miniatura de estabelecimento.
- video.png: camera de video ao lado de notebook com timeline de edicao e preview.
- messaging.png: smartphone com mensagens comerciais, contatos e catalogo, detalhes verdes.
