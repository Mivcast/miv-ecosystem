-- Add one event type without changing existing events, RLS, grants or retention.
begin;
alter table public.analytics_events drop constraint analytics_events_name_check;
alter table public.analytics_events add constraint analytics_events_name_check check
 (name in ('page_view','card_view','card_click','card_open','favorite_add','analysis_start','analysis_complete','solution_view','report_created','tool_open','market_search','mark_open'));
commit;
