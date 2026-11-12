-- ============================================================================
-- HARDCODED AUTH SCHEMA — Run this in Supabase SQL Editor
-- This schema is modified to work with hardcoded authentication instead of Supabase Auth
-- It removes dependencies on auth.users table and uses a fixed user_id
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

-- Clients table (no auth.users dependency)
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000001',
  name text not null,
  contact_info text not null default '',
  project_status text not null default 'active'
    check (project_status in ('active', 'completed', 'delivered', 'on_hold', 'cancelled')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Transactions table (no auth.users dependency)
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000001',
  client_id uuid references public.clients(id) on delete set null,
  date date not null default current_date,
  type text not null check (type in ('income', 'expense')),
  category text not null default 'other',
  description text not null default '',
  amount numeric(12,2) not null default 0,
  payment_status text not null default 'pending'
    check (payment_status in ('paid', 'pending', 'overdue')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User settings table (no auth.users dependency)
create table if not exists public.user_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique default '00000000-0000-0000-0000-000000000001',
  currency text not null default 'EGP'
    check (currency in ('EGP', 'SAR', 'AED', 'USD', 'EUR')),
  locale text not null default 'ar' check (locale in ('ar', 'en')),
  theme text not null default 'system'
    check (theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Workers table (no auth.users dependency)
create table if not exists public.workers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000001',
  name text not null,
  job_title text not null default '',
  monthly_salary numeric(12,2) not null default 0,
  phone text not null default '',
  notes text not null default '',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Worker attendance table (no auth.users dependency)
create table if not exists public.worker_attendance (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid not null references public.workers(id) on delete cascade,
  date date not null,
  day text not null default '',
  check_in_time text not null default '',
  departure_time text not null default '',
  daily_hours numeric(5,2) not null default 9,
  delay text not null default '',
  deduction numeric(12,2) not null default 0,
  advances numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------

create unique index if not exists user_settings_user_id_key on public.user_settings(user_id);
create index if not exists idx_clients_user_id on public.clients(user_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_client_id on public.transactions(client_id);
create index if not exists idx_transactions_date on public.transactions(date);
create index if not exists idx_transactions_type on public.transactions(type);
create index if not exists idx_workers_user_id on public.workers(user_id);
create index if not exists idx_worker_attendance_worker_id on public.worker_attendance(worker_id);
create index if not exists idx_worker_attendance_date on public.worker_attendance(date);

-- ----------------------------------------------------------------------------
-- Triggers
-- ----------------------------------------------------------------------------

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
  before update on public.clients
  for each row execute function public.handle_updated_at();

drop trigger if exists set_transactions_updated_at on public.transactions;
create trigger set_transactions_updated_at
  before update on public.transactions
  for each row execute function public.handle_updated_at();

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.handle_updated_at();

drop trigger if exists set_workers_updated_at on public.workers;
create trigger set_workers_updated_at
  before update on public.workers
  for each row execute function public.handle_updated_at();

drop trigger if exists set_worker_attendance_updated_at on public.worker_attendance;
create trigger set_worker_attendance_updated_at
  before update on public.worker_attendance
  for each row execute function public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security (Simplified for single user)
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables
alter table public.clients enable row level security;
alter table public.transactions enable row level security;
alter table public.user_settings enable row level security;
alter table public.workers enable row level security;
alter table public.worker_attendance enable row level security;

-- Drop existing policies
do $$
declare
  r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'clients',
        'transactions',
        'user_settings',
        'workers',
        'worker_attendance'
      )
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Since we have a single hardcoded user, allow all authenticated operations
-- In production with Supabase, you would use the anon key

-- Clients policies
create policy "Allow all operations on clients"
  on public.clients for all
  using (true)
  with check (true);

-- Transactions policies
create policy "Allow all operations on transactions"
  on public.transactions for all
  using (true)
  with check (true);

-- User settings policies
create policy "Allow all operations on user_settings"
  on public.user_settings for all
  using (true)
  with check (true);

-- Workers policies
create policy "Allow all operations on workers"
  on public.workers for all
  using (true)
  with check (true);

-- Worker attendance policies
create policy "Allow all operations on worker_attendance"
  on public.worker_attendance for all
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------
-- Permissions
-- ----------------------------------------------------------------------------

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on
  public.clients,
  public.transactions,
  public.user_settings,
  public.workers,
  public.worker_attendance
to anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- Insert default user settings
-- ----------------------------------------------------------------------------

insert into public.user_settings (user_id, currency, locale, theme)
values ('00000000-0000-0000-0000-000000000001', 'EGP', 'ar', 'system')
on conflict (user_id) do nothing;
