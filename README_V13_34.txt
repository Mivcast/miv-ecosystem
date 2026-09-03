MIV Ecosystem V13.34 — REFRESH VISUAL AUTOMATICO DO PLANO

Correção após teste da V13.33:
- /api/sync-my-subscription já sincronizava corretamente o Mercado Pago e o Supabase.
- A Minha Central podia continuar exibindo Grátis por estado visual antigo.

V13.34:
- aplica imediatamente no frontend o plano ativo retornado pelo endpoint;
- força nova leitura do Supabase após a sincronização;
- renderiza novamente a Minha Central depois da confirmação;
- mantém o botão Atualizar do Admin apenas como contingência.

Sem SQL novo. Sem alteração de webhook, secrets ou pagamentos.
