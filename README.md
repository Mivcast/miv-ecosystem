# MIV Ecosystem V13.16 — Checkout Mercado Pago (teste)

Esta versão conecta o botão de compra avulsa do Script inteligente de WhatsApp ao Checkout Pro do Mercado Pago em ambiente de teste. O preço e o item são validados no backend; o Access Token permanece apenas nas variáveis de ambiente da Vercel. A liberação automática após pagamento será implementada na próxima etapa via Webhook assinado.

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

## V13.15 — Admin V1 real
- admin.html agora usa Supabase Auth e exige profiles.role = admin.
- Dashboard real: usuários, empresas, assinaturas e compras/liberações.
- Ativar/cancelar PRO/Premium por 30 dias.
- Liberar/revogar item avulso por ID.
- Execute SUPABASE_V13_15_ADMIN_V1.sql antes de usar.
