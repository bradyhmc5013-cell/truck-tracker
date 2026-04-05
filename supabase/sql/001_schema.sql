create extension if not exists "pgcrypto";

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  carrier_name text not null,
  phone text,
  mc_number text,
  stripe_customer_id text,
  stripe_subscription_status text not null default 'inactive', -- inactive|active|trialing|past_due|canceled
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TRUCKS
create table if not exists public.trucks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  truck_label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists trucks_profile_id_idx on public.trucks(profile_id);

-- DEFAULTS
create table if not exists public.detention_defaults (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  free_minutes int not null default 120,
  rate_per_hour_cents int not null default 7500,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint detention_defaults_free_minutes_nonneg check (free_minutes >= 0),
  constraint detention_defaults_rate_nonneg check (rate_per_hour_cents >= 0)
);

-- LOADS
do $$
begin
  if not exists (select 1 from pg_type where typname = 'load_status') then
    create type public.load_status as enum ('tracking', 'eligible', 'sent');
  end if;
  if not exists (select 1 from pg_type where typname = 'stop_type') then
    create type public.stop_type as enum ('pickup', 'delivery');
  end if;
  if not exists (select 1 from pg_type where typname = 'attachment_type') then
    create type public.attachment_type as enum ('bol', 'ratecon', 'gatepass', 'lumper', 'other');
  end if;
end$$;

create table if not exists public.loads (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  truck_id uuid not null references public.trucks (id) on delete restrict,

  broker_name text,
  broker_email text,
  load_ref text,

  pickup_name text not null,
  pickup_city text not null,
  delivery_name text not null,
  delivery_city text not null,

  status public.load_status not null default 'tracking',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists loads_profile_id_idx on public.loads(profile_id);
create index if not exists loads_truck_id_idx on public.loads(truck_id);
create index if not exists loads_status_idx on public.loads(status);

-- STOP EVENTS (exactly 2 per load)
create table if not exists public.stop_events (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references public.loads (id) on delete cascade,
  stop_type public.stop_type not null,
  arrived_at timestamptz,
  departed_at timestamptz,
  reason_code text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint stop_events_unique_per_load unique (load_id, stop_type),
  constraint stop_events_time_order check (
    arrived_at is null
    or departed_at is null
    or departed_at >= arrived_at
  )
);
create index if not exists stop_events_load_id_idx on public.stop_events(load_id);

-- ATTACHMENTS
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references public.loads (id) on delete cascade,
  type public.attachment_type not null default 'other',
  storage_path text not null,
  created_at timestamptz not null default now()
);
create index if not exists attachments_load_id_idx on public.attachments(load_id);

-- INVOICES
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  load_id uuid not null references public.loads (id) on delete cascade,

  invoice_number text not null,
  invoice_date date not null default (now() at time zone 'utc')::date,
  due_date date not null default ((now() at time zone 'utc')::date + 15),

  pickup_detention_cents int not null default 0,
  delivery_detention_cents int not null default 0,
  tonu_cents int not null default 0,
  total_cents int not null default 0,

  pdf_storage_path text,
  pdf_generated_at timestamptz,

  created_at timestamptz not null default now(),

  constraint invoices_one_per_load unique (load_id),
  constraint invoices_invoice_number_unique_per_profile unique (profile_id, invoice_number),
  constraint invoices_amounts_nonneg check (
    pickup_detention_cents >= 0 and delivery_detention_cents >= 0 and tonu_cents >= 0 and total_cents >= 0
  )
);
create index if not exists invoices_profile_id_idx on public.invoices(profile_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'profiles_set_updated_at') then
    create trigger profiles_set_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trucks_set_updated_at') then
    create trigger trucks_set_updated_at
    before update on public.trucks
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'detention_defaults_set_updated_at') then
    create trigger detention_defaults_set_updated_at
    before update on public.detention_defaults
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'loads_set_updated_at') then
    create trigger loads_set_updated_at
    before update on public.loads
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'stop_events_set_updated_at') then
    create trigger stop_events_set_updated_at
    before update on public.stop_events
    for each row execute function public.set_updated_at();
  end if;
end$$;