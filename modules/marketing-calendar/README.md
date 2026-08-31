# Card 01 — Calendário Inteligente de Marketing

## Objetivo
Ser um estrategista de marketing baseado em calendário.

O calendário deve mostrar datas durante todo o ano e, ao abrir qualquer evento,
explicar como aquela data pode ser aproveitada pela empresa.

## Fontes de eventos
1. Brasil / nacionais.
2. Datas móveis.
3. Profissionais.
4. Nicho/subnicho.
5. Cidade/estado.
6. Eventos locais.
7. Empresa.
8. Equipe.
9. Pessoais.
10. Sazonais.
11. Comerciais.

## Primeira configuração
- confirmar nicho;
- opcionalmente confirmar/informar cidade;
- importar informações do Perfil Mestre;
- permitir datas da empresa, equipe e pessoais;
- montar o calendário;
- salvar no Supabase.

A configuração permanece salva até atualização solicitada pelo usuário ou
atualização programada de fontes dinâmicas.

## Abertura de um evento
Ao clicar numa comemoração:
1. abrir detalhes;
2. mostrar origem/tipo;
3. calcular relevância para a empresa;
4. explicar a relação;
5. sugerir abordagem apropriada;
6. nos planos pagos, gerar ideias completas.

## Regra central
Toda data pode gerar uma ideia, mas nem toda data deve gerar promoção.

Classificação:
- alta relação;
- relação indireta;
- baixa relação.

Quando a relação for baixa, preferir reconhecimento, conteúdo institucional ou
não recomendar ação comercial forçada.

## Oportunidades do mês
O sistema deve destacar automaticamente as datas mais relevantes para o perfil
do usuário.

## Filtros
- Todas
- Recomendadas
- Brasil
- Nicho
- Cidade
- Empresa
- Equipe
- Pessoais

## Persistência
Salvar:
- configuração do calendário;
- eventos resolvidos;
- eventos personalizados;
- última atualização;
- ideias salvas;
- campanhas planejadas.

## Relatório
O módulo pode gerar um relatório/plano do mês contendo:
- oportunidades recomendadas;
- eventos escolhidos;
- ideias salvas;
- campanhas planejadas;
- pendências.

## V11 protótipo
Navegação mensal, clique nas datas, personalização e datas próprias funcionam em `file://` usando `localStorage`. A busca automática de eventos da cidade/nicho será ligada ao backend.
