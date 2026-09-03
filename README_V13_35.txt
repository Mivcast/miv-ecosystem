MIV ECOSYSTEM — V13.35 GESTÃO DE ASSINATURA

OBJETIVO
Fechar a gestão do plano dentro da Minha Central, reduzindo dependência do Admin.

NOVIDADES
- Minha Central mostra plano, valor, próxima cobrança e status.
- PRO: botão de upgrade para Premium.
- Premium: downgrade para PRO pode ser programado para a próxima cobrança.
- Downgrade programado pode ser desfeito antes da data.
- Cancelamento interrompe a renovação no Mercado Pago, mas preserva o acesso até o fim do período já pago.
- Sincronização automática respeita cancelamento no fim do ciclo e mudança programada de plano.
- Webhook mantém essas regras mesmo quando o Mercado Pago envia atualização de status.
- Admin continua como contingência, não como etapa obrigatória para o cliente.

ANTES DO DEPLOY
1. Execute SUPABASE_V13_35_GESTAO_ASSINATURA.sql no projeto MIV Ecosystem.
2. Faça o deploy completo desta versão na Vercel.
3. Ctrl+F5.

TESTE RECOMENDADO
- Premium ativo: abrir Minha Central e verificar dados da assinatura.
- Programar downgrade para PRO e confirmar aviso/data.
- Cancelar o downgrade e confirmar manutenção do Premium.
- Não é necessário realizar nova cobrança apenas para validar a interface.

OBSERVAÇÃO
A alteração de valor de uma assinatura existente usa o endpoint oficial PUT /preapproval/{id} do Mercado Pago. A mudança de acesso local é aplicada na data programada pela sincronização/webhook.
