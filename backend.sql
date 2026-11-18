create table public.reader_state (
 user_id uuid primary key references auth.users(id) on delete cascade,
 revision integer not null default 1 check (revision > 0),
 payload jsonb not null check (jsonb_typeof(payload) = 'object' and payload ? 'books' and jsonb_typeof(payload->'books') = 'array' and octet_length(payload::text) <= 4194304)
);
alter table public.reader_state enable row level security;
revoke all on public.reader_state from public, anon, authenticated;
grant select, insert, update on public.reader_state to authenticated;
create policy reader_select on public.reader_state for select to authenticated using ((select auth.uid()) = user_id);
create policy reader_insert on public.reader_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy reader_update on public.reader_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
