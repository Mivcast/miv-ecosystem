MIV ECOSYSTEM V13.36 — FECHAMENTO DE ASSINATURAS / UPGRADE SEGURO

Objetivo: fechar os pontos críticos do ciclo PRO/Premium antes da preparação de produção.

Alterações:
1. Upgrade PRO -> Premium agora é seguro:
   - o PRO NÃO é cancelado ao clicar em upgrade;
   - o PRO permanece ativo enquanto o checkout Premium está pendente;
   - somente após o Premium ficar authorized/active o MIV encerra a recorrência PRO antiga.
   - se o cliente desistir do checkout Premium, continua com PRO normalmente.

2. Dupla proteção para concluir upgrade:
   - webhook encerra o PRO anterior quando Premium é confirmado;
   - sync-my-subscription faz a mesma reconciliação caso o webhook atrase.

3. Tentativas pendentes antigas:
   - ao reiniciar contratação do mesmo plano, uma tentativa pending anterior é cancelada antes da nova tentativa;
   - evita o usuário ficar preso a um checkout abandonado.

4. Segurança TESTE x PRODUÇÃO:
   - MERCADOPAGO_TEST_PAYER_EMAIL só é usada quando MERCADOPAGO_ACCESS_TOKEN começa com TEST-;
   - com token produtivo, o sistema ignora automaticamente o payer de teste e usa o e-mail real do usuário.

5. Webhook health version atualizado para 13.36.

SQL novo: NÃO.
Não altera preços, cupons, MARK.IA, catálogo ou conteúdo.
