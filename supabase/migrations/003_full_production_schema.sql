-- ============================================================================
-- PRODUCTION SCHEMA — run this whole file once in the Supabase SQL Editor.
-- Safe to re-run. It creates every table the app uses, repairs an older
-- 001 schema (nullable client, workshop categories, "delivered" status),
-- backfills profiles / settings for users who already signed up, and
-- replaces row level security with the rules the app enforces:
--   * every signed-in user can read the shared books
--   * every signed-in user can add transactions, workers, and attendance
--   * only admins can add, edit, or delete clients
--   * only admins can edit or delete transactions
--   * each user can read and update only their own settings
-- Do not run 001_initial_schema.sql or 002_rbac_schema.sql after this file.
-- After it finishes, sign out and sign in once so the role is in the JWT.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists full_name text not null default '';
alter table public.profiles add column if not exists email text not null default '';

create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  contact_info text not null default '',
  project_status text not null default 'active'
    check (project_status in ('active', 'completed', 'delivered', 'on_hold', 'cancelled')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
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

create table if not exists public.user_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  currency text not null default 'EGP'
    check (currency in ('EGP', 'SAR', 'AED', 'USD', 'EUR')),
  locale text not null default 'ar' check (locale in ('ar', 'en')),
  theme text not null default 'system'
    check (theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  job_title text not null default '',
  monthly_salary numeric(12,2) not null default 0,
  phone text not null default '',
  notes text not null default '',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Repair databases created from the older 001 script
-- ----------------------------------------------------------------------------

alter table public.transactions alter column client_id drop not null;
alter table public.transactions alter column category set default 'other';

do $$
declare
  r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'transactions'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%category%'
  loop
    execute format('alter table public.transactions drop constraint %I', r.conname);
  end loop;

  for r in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    join unnest(con.conkey) as cols(attnum) on true
    join pg_attribute att
      on att.attrelid = rel.oid
     and att.attnum = cols.attnum
    where nsp.nspname = 'public'
      and rel.relname = 'transactions'
      and con.contype = 'f'
      and att.attname = 'client_id'
  loop
    execute format('alter table public.transactions drop constraint %I', r.conname);
  end loop;

  for r in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'clients'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%project_status%'
  loop
    execute format('alter table public.clients drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.transactions
  drop constraint if exists transactions_client_id_fkey;

alter table public.transactions
  add constraint transactions_client_id_fkey
  foreign key (client_id) references public.clients(id) on delete set null;

alter table public.clients
  drop constraint if exists clients_project_status_check;

alter table public.clients
  add constraint clients_project_status_check
  check (project_status in ('active', 'completed', 'delivered', 'on_hold', 'cancelled'));

create unique index if not exists user_settings_user_id_key on public.user_settings(user_id);
create index if not exists idx_profiles_role on public.profiles(role);
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

create or replace function public.is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  jwt_role text;
  db_role text;
begin
  begin
    jwt_role := nullif(
      current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role',
      ''
    );
  exception when others then
    jwt_role := null;
  end;

  if jwt_role = 'admin' then
    return true;
  end if;

  select role into db_role from public.profiles where id = auth.uid();
  return db_role = 'admin';
end;
$$;

create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role text;
begin
  perform pg_advisory_xact_lock(872364);

  if exists (select 1 from public.profiles where role = 'admin') then
    assigned_role := 'viewer';
  else
    assigned_role := 'admin';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    assigned_role
  )
  on conflict (id) do nothing;

  update auth.users
  set raw_app_meta_data =
    coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', assigned_role)
  where id = new.id;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_role on auth.users;
create trigger on_auth_user_created_role
  after insert on auth.users
  for each row execute function public.handle_new_user_role();

-- Existing accounts created before this trigger.
insert into public.profiles (id, email, full_name, role)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data->>'full_name', ''),
  'viewer'
from auth.users u
on conflict (id) do nothing;

update public.profiles p
set
  email = coalesce(u.email, ''),
  full_name = case
    when coalesce(p.full_name, '') = '' then coalesce(u.raw_user_meta_data->>'full_name', '')
    else p.full_name
  end
from auth.users u
where u.id = p.id;

update public.profiles
set role = 'admin'
where not exists (select 1 from public.profiles where role = 'admin')
  and id = (
    select p.id
    from public.profiles p
    join auth.users u on u.id = p.id
    order by u.created_at
    limit 1
  );

update auth.users u
set raw_app_meta_data =
  coalesce(u.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', p.role)
from public.profiles p
where p.id = u.id;

insert into public.user_settings (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- ----------------------------------------------------------------------------
-- Row level security
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.transactions enable row level security;
alter table public.user_settings enable row level security;
alter table public.workers enable row level security;
alter table public.worker_attendance enable row level security;

do $$
declare
  r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'profiles',
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

create policy "Authenticated users can view profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Admins can update profiles"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Authenticated users can view clients"
  on public.clients for select
  to authenticated
  using (true);

create policy "Admins can insert clients"
  on public.clients for insert
  to authenticated
  with check (public.is_admin() and auth.uid() = user_id);

create policy "Admins can update clients"
  on public.clients for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete clients"
  on public.clients for delete
  to authenticated
  using (public.is_admin());

create policy "Authenticated users can view transactions"
  on public.transactions for select
  to authenticated
  using (true);

create policy "Authenticated users can insert transactions"
  on public.transactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Admins can update transactions"
  on public.transactions for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete transactions"
  on public.transactions for delete
  to authenticated
  using (public.is_admin());

create policy "Users can view own settings"
  on public.user_settings for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own settings"
  on public.user_settings for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on public.user_settings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Authenticated users can view workers"
  on public.workers for select
  to authenticated
  using (true);

create policy "Authenticated users can insert workers"
  on public.workers for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Authenticated users can update workers"
  on public.workers for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete workers"
  on public.workers for delete
  to authenticated
  using (true);

create policy "Authenticated users can view attendance"
  on public.worker_attendance for select
  to authenticated
  using (true);

create policy "Authenticated users can insert attendance"
  on public.worker_attendance for insert
  to authenticated
  with check (
    exists (
      select 1 from public.workers w where w.id = worker_id
    )
  );

create policy "Authenticated users can update attendance"
  on public.worker_attendance for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete attendance"
  on public.worker_attendance for delete
  to authenticated
  using (true);

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on
  public.profiles,
  public.clients,
  public.transactions,
  public.user_settings,
  public.workers,
  public.worker_attendance
to authenticated;

grant all privileges on
  public.profiles,
  public.clients,
  public.transactions,
  public.user_settings,
  public.workers,
  public.worker_attendance
to service_role;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.handle_updated_at() to authenticated;
