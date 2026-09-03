MIV Ecosystem V13.32 — MIGRAÇÃO DE PLANOS

- PRO ativo + clique Premium: fluxo de upgrade imediato.
- A recorrência PRO é cancelada no Mercado Pago antes da criação da Premium para evitar duas recorrências ativas.
- O checkout Premium é então aberto normalmente.
- Mesmo plano: botão vira Plano atual e não cria nova assinatura.
- Premium -> PRO: bloqueado nesta versão e orientado como downgrade para próximo ciclo.
- Botões dos planos refletem Plano atual / Fazer upgrade para Premium / Downgrade para PRO.
- Mantém webhook, secrets e sincronização V13.31 sem alterações.

IMPORTANTE: no upgrade, a assinatura PRO é encerrada antes da conclusão do checkout Premium. Se o usuário abandonar o checkout, ficará sem assinatura ativa até contratar novamente. Uma versão futura pode implementar troca transacional/prorrata mais sofisticada.
