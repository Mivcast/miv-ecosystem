begin;
-- Nullable for historical receipts; new document checkouts bind to the quoted revision.
alter table public.user_purchases add column commerce_revision integer check(commerce_revision>0);
commit;
