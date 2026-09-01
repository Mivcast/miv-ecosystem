# MIV Ecosystem — V13.11 RELATÓRIO COMPLETO

Baseada na V13.10.

## Alterações
- “Ver relatório” abre uma página completa, não mais um popup-resumo.
- Página de relatório integrada ao histórico do navegador (Voltar retorna à Minha Central).
- Novos relatórios passam a salvar respostas, checklist e prioridades dentro do JSONB `meta` já existente no Supabase.
- Relatórios antigos continuam abrindo, mas exibem somente os dados que já haviam sido persistidos.
- Impressão do relatório completo.
- Não exige SQL novo.


## V13.12
- Corrige salvamento de relatórios em checklists de canais, marketing, marca e vendas (erro `def.map is not a function`).
- Relatório completo ganhou Imprimir, Salvar em PDF, WhatsApp e Compartilhar.
- Salvar em PDF usa a impressão do navegador: escolha **Salvar como PDF** no destino.
