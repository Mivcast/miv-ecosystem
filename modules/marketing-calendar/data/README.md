# Dados do calendário

A lista anual fornecida pelo proprietário do projeto será tratada como BASE DE
REFERÊNCIA para o dataset inicial de 2026.

Antes de produção, normalizar:
- duplicidades;
- nomes;
- escopo;
- categoria;
- datas fixas;
- datas móveis;
- feriados;
- datas estaduais/municipais;
- datas religiosas;
- eventos históricos;
- validade temporal.

Não gravar datas móveis como se fossem fixas.

Estrutura recomendada:
- base nacional permanente;
- resolvedor anual de datas móveis;
- eventos por nicho;
- eventos locais dinâmicos;
- eventos personalizados do usuário.

O sistema deve registrar fonte e data de verificação para eventos dinâmicos.
