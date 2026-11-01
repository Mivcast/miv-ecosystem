# Entrada do diagnóstico e recursos visuais

## Comportamento

- Primeira dobra com uma ação principal, diagnóstico gratuito; exploração é secundária.
- Exemplo explicitamente ilustrativo de resultado e três passos antes da escolha do nicho.
- Diagnóstico rápido de oito pontos: dois por etapa, usando IDs e perguntas do catálogo vigente. Não substitui os 60 pontos nem certifica a saúde da empresa.
- Sim/Parcialmente/Não correspondem a 2/1/0. Não sei avaliar é null, excluído da nota. Resultado informa cobertura e incertezas.
- Visitantes recebem a leitura sem cadastro. O resultado avisa que não está salvo em uma conta. Aprofundar conserva o fluxo de cadastro existente.
- Contas conectadas podem salvar somente respostas pontuadas mediante confirmação explícita; anotações e demais respostas são mantidas. Mudança de conta, empresa ou nicho invalida a sessão rápida.
- A leitura inicial não libera conteúdo pago nem consome soluções grátis. A análise completa e seus direitos permanecem intactos.
- Planos e exemplos de uso vêm antes das demais vitrines. Textos dos relatos preservados a pedido do responsável, identificados como ilustrativos enquanto aguardam comprovação/substituição. Fotos inexistentes não são requisitadas. Números sem origem confirmada permanecem no código, ocultos da exibição pública.
- Niche thumbs consultam índice de arquivos reais, com fallback de categoria conhecido, eliminando tentativas de extensões inexistentes.
- MARK flutuante usa emblema local. Faixa de nicho não flutua no mobile; cabeçalho compacto após rolagem.
- Vinte serviços usam vinte arquivos diferentes; quatorze novas artes com alpha, seis existentes adequadas. Origens geradas preservadas; arquivos WebP preparados para entrega. Prompts em acquisition-images-2026-11-01.json.

## Métricas

analysis_start e analysis_complete distinguem quick/complete no painel. Conclusão rápida ocorre após oito respostas, inclusive incertezas; conclusão completa exige todos os 60 pontos e a ação de gerar relatório. Não comparar essas duas coberturas como se fossem o mesmo resultado.

Com métricas aceitas, as páginas públicas enviam diagnosis_start, diagnosis_complete e view_solution ao GA4. Sem respostas, anotações ou nomes de nichos nos novos eventos GA. Preferências, GPC/DNT e exclusão de rotas privadas preservados. Pagamentos continuam vindos do registro confirmado pelo provedor; não há purchase derivado de URL de retorno.

Migração aditiva de enum de eventos aplicada e conferida: RLS ativo, anon/authenticated sem SELECT. Nenhum dado apagado e nenhuma mudança nas permissões.

Não foram alteradas campanhas, palavras-chave, redes ou importações de conversão no Google Ads. Termos de pesquisa e relatórios da conta ainda são necessários para investigar atribuição. Nenhuma alegação de tráfego inválido é feita com base em referências isoladas.

## Verificação

Testes Node; browser Chromium: catálogo, evolução, acesso gratuito/avulso/Pro/Premium, privacidade/MFA, administração comercial, analytics e GA simulado; novo teste da jornada rápida, gravação explícita, isolamento de conta e preservação da cota gratuita. Layout 320/360/390/430/700/768 sem overflow e com próximo card visível. Jornada rápida e layout também em WebKit. Artefatos visuais em outputs (não publicados).

Integrações de pagamento e autenticação são simuladas nos testes de navegador. Nenhuma compra real foi feita. Conformidade jurídica integral e aceitação comercial não são garantidas por esses testes.

## Publicação e rollback

Checkpoint local: checkpoint/pre-audit-2026-11-01. Base de produção anterior: 9f6d885fb82b28f03e351d91f858d4b650cab770. Publicar pelo Git/Vercel após testes. Se necessário, reverter o commit de interface/API no Git para reconstruir a versão anterior. A ampliação do enum é compatível com a versão anterior e pode permanecer; não apagar métricas coletadas em rollback.

Não incluir index_miv_ecosystem_jornada.html nem indexteste.html no commit ou na pasta pública: são referências do usuário.
