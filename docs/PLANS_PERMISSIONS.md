# Plans and Permissions

## Planos

| Plano | Regra no codigo | MARK.IA/mensal | Observacao |
|---|---|---:|---|
| Gratis | Sem assinatura ativa | 5 | Acesso a cards gratis e pre-resumos locais |
| Pro | `user_subscriptions.plan = pro` e `status = active` | 80 | Libera cards Pro/Pago e analises com IA |
| Premium | `user_subscriptions.plan = premium` e `status = active` | 300 | Libera tudo do Pro com franquia maior |
| Avulso | `user_purchases.status = paid` por item | conforme plano | Libera item comprado |

## Validacao

- Frontend usa `hasItemAccess()` para UX.
- Backend deve validar JWT e permissao novamente.
- `analysis-ai` exige Pro/Premium.
- `mark-ai` impede contexto de card pago sem acesso ao item ou plano.
- `calendar-ai` deve proteger geracao completa de ideias.

## Riscos

- Nao confiar em alteracao visual no navegador.
- Confirmar que todas as APIs pagas repetem a validacao server-side.
- Confirmar que `subscription_plans` esta legivel para carregar precos onde necessario.
