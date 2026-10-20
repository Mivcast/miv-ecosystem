# Resultados & Comportamento

## Scope

Administrator-only dashboard: sales, refunds, checkout funnel, card rankings,
consented navigation, sources/campaigns, devices, niches, plans and aggregate
business registration locations. Dates use America/Sao_Paulo calendar days.
No prices, access allowances or existing entitlement rules are changed.

## Metric definitions

- Revenue comes from verified Mercado Pago payments, never browser events.
- Net revenue subtracts recorded refunds, before processing fees and taxes.
- Refunds are attributed to the original sale date, not the refund date.
- Production, sandbox and legacy unknown-environment payments are separate.
- Existing numeric provider purchase records seed only partial legacy history.
  Manual grants, free unlocks and fully discounted purchases are not revenue.
- Checkout conversion uses orders created in the selected period and payments
  observed by query time. An unpaid attempt older than 24 hours is estimated
  abandonment. Pending and refused payments are shown separately.
- Subscription authorization alone is not revenue. Invoice notifications fetch
  the verified underlying payment before recording revenue.
- Visitors are browser identifiers, not unique people. Sessions expire after
  30 minutes idle. Opt-out, another browser or device can change these counts.
- Card exposure requires its observed visual/title to be at least 50% visible
  for one second. Opens and clicks are distinct events.
- Card rankings return at most 100 entries; source/niche rankings at most 50;
  registered location rankings at most 30.
- Business registration/active-plan/location panels are explicitly global
  aggregates, not demographic estimates for filtered anonymous visitors.

## Privacy and security

Navigation collection requires optional explicit consent and honors GPC/DNT.
Preferences can be changed from the footer. No answers, company form contents,
MARK conversations, full URLs, IP addresses, age or gender are collected as
navigation events. Locations come from company-provided records.

Browser identifiers expire after 30 days. Raw events older than 90 days are
cleaned during ingestion, at most once daily; an inactive site does not trigger
that cleanup until ingestion resumes. Financial records are separate.

All analytics tables have RLS and no anonymous/authenticated table privileges.
RPC execution is service-role-only. The report API independently verifies the
account's stored administrator role. Client identity, plan, amounts and event
timestamps are not trusted. Ingest batches and event budgets are bounded.

Checkout tracking failures do not block creation of a payment. A verified
approved payment still grants existing access before a journal failure returns
an error requesting webhook retry. Provider IDs make journal updates idempotent
and stale notifications cannot replace newer state.

## Database changes

Applied to MIV Ecosystem (wgqdpzsqxicvaafktwnp):

- 20261020163439_admin_analytics.sql
- 20261020164300_analytics_payment_environment.sql

These are additive. No existing user records were deleted. To roll back the UI,
restore the previous application release; the unused additive tables can remain.
Do not drop financial history as part of an application rollback.

## Verification

38 Node tests passed across analytics, commerce, diagnosis API, routing and public
build isolation. Browser QA covers consent, opt-out, GPC, impressions, clicks,
opens, CSV escaping, administrator filtering and 320/390/768/1440px layouts.
Transactional SQL fixtures test deduplication, stale payments, refunds, sandbox,
abandonment, filtering and privileges, then roll back all fixtures.

Existing diagnosis, evolution, mobile and administrator commerce browser suites
also passed. Browser financial data is mocked, not real sales.

Real authenticated owner-account QA and full Mercado Pago sandbox purchase /
recurring invoice homologation remain separate launch checks. Do not equate
these automated tests with a completed real payment or proven revenue accuracy
for legacy records not available to the journal.
