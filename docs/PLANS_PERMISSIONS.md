# Plans and Permissions

## Planos

| Plano | Regra no codigo | MARK.IA/mensal | Observacao |
|---|---|---:|---|
| Gratis | Sem assinatura ativa | 5 | Duas solucoes individuais por conta, uma unica vez; responder as etapas e gratuito |
| Pro | Assinatura ativa e nao vencida | 80 | Todas as solucoes das etapas; sem MARK nas analises por padrao |
| Premium | Assinatura ativa e nao vencida | 300 | Todas as solucoes e MARK nas analises, dentro da franquia |
| Avulso | `user_purchases.status = paid` por item | conforme plano | Card completo com tres solucoes, por R$ 19,90; nao inclui MARK nas analises |

Os valores e permissoes acima sao padroes. Precos e franquias pagas vem de
`subscription_plans`; cota, preco de analise e MARK por plano vem de `diagnosis_rules`.
Reabrir uma cortesia ou compra nao consome outra; assinatura nao consome cortesias.
O dossie mensal continua separado: Premium ou compra de `monthly-strategy-plan`.

## Validacao

- Frontend usa `hasItemAccess()` para UX.
- Backend deve validar JWT e permissao novamente.
- `analysis-ai` e o contexto de diagnostico em `mark-ai` exigem permissao em `diagnosis_rules` (Premium por padrao).
- `mark-ai` impede contexto de card pago sem acesso ao item ou plano.
- `calendar-ai` deve proteger geracao completa de ideias.
- `api/diagnoses` valida JWT, empresa, direitos e dados; o banco serializa cortesias por usuario.
- `diagnosis_access` e `diagnosis_save_point` so podem ser executadas por service_role.
- O navegador nao pode inserir desbloqueios nem escrever diretamente nos workspaces.

## Riscos

- Nao confiar em alteracao visual no navegador.
- Confirmar que todas as APIs pagas repetem a validacao server-side.
- Confirmar que `subscription_plans` esta legivel para carregar precos onde necessario.

## Ajuste V13.40

- `subscription_plans` precisa ter uma policy publica simples para `active = true`.
- A policy publica nao deve chamar `public.is_admin()`, porque visitantes anonimos podem nao ter permissao de executar a funcao.
- A leitura/gestao administrativa fica em policy separada para usuarios autenticados admin.
