alter table public.profiles enable row level security;
alter table public.trucks enable row level security;
alter table public.detention_defaults enable row level security;
alter table public.loads enable row level security;
alter table public.stop_events enable row level security;
alter table public.attachments enable row level security;
alter table public.invoices enable row level security;

-- PROFILES
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select to authenticated
using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- TRUCKS
drop policy if exists "trucks_crud_own" on public.trucks;
create policy "trucks_crud_own"
on public.trucks
for all to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

-- DEFAULTS
drop policy if exists "detention_defaults_crud_own" on public.detention_defaults;
create policy "detention_defaults_crud_own"
on public.detention_defaults
for all to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

-- LOADS
drop policy if exists "loads_crud_own" on public.loads;
create policy "loads_crud_own"
on public.loads
for all to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

-- STOP EVENTS (via load ownership)
drop policy if exists "stop_events_crud_own_via_load" on public.stop_events;
create policy "stop_events_crud_own_via_load"
on public.stop_events
for all to authenticated
using (
  exists (select 1 from public.loads l where l.id = stop_events.load_id and l.profile_id = auth.uid())
)
with check (
  exists (select 1 from public.loads l where l.id = stop_events.load_id and l.profile_id = auth.uid())
);

-- ATTACHMENTS (via load ownership)
drop policy if exists "attachments_crud_own_via_load" on public.attachments;
create policy "attachments_crud_own_via_load"
on public.attachments
for all to authenticated
using (
  exists (select 1 from public.loads l where l.id = attachments.load_id and l.profile_id = auth.uid())
)
with check (
  exists (select 1 from public.loads l where l.id = attachments.load_id and l.profile_id = auth.uid())
);

-- INVOICES
drop policy if exists "invoices_crud_own" on public.invoices;
create policy "invoices_crud_own"
on public.invoices
for all to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());