-- SUPERSEDED. Do not run this file. Use 003_full_production_schema.sql instead.
-- ==============================================================================
-- 002_rbac_schema.sql: 3-Layer Role-Based Access Control (RBAC)
-- Roles: 'admin', 'viewer'
-- ==============================================================================

-- 1. Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at timestamptz default now() not null
);

create index if not exists idx_profiles_role on public.profiles(role);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- 2. Helper function to check if current requesting user is an admin
-- Checks JWT app_metadata claim first for fast zero-query resolution,
-- falling back to the profiles table.
create or replace function public.is_admin()
returns boolean as $$
declare
  jwt_role text;
  db_role text;
begin
  -- 1. Try reading from JWT claims (app_metadata.role)
  begin
    jwt_role := nullif(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', '');
  exception when others then
    jwt_role := null;
  end;

  if jwt_role = 'admin' then
    return true;
  end if;

  -- 2. Fallback to profiles table query
  select role into db_role
  from public.profiles
  where id = auth.uid();

  return db_role = 'admin';
end;
$$ language plpgsql security definer stable;

-- 3. First-Admin Bootstrapping & JWT app_metadata Sync Trigger
create or replace function public.handle_new_user_role()
returns trigger as $$
declare
  user_count int;
  assigned_role text;
begin
  -- Check if profiles table is empty
  select count(*) into user_count from public.profiles;

  if user_count = 0 then
    assigned_role := 'admin';
  else
    assigned_role := 'viewer';
  end if;

  -- Insert profile
  insert into public.profiles (id, email, role)
  values (new.id, coalesce(new.email, ''), assigned_role)
  on conflict (id) do nothing;

  -- Sync role directly into auth.users.raw_app_meta_data so it appears in JWT app_metadata
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', assigned_role)
  where id = new.id;

  -- Auto-create user settings if not exists
  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Attach trigger to auth.users table
drop trigger if exists on_auth_user_created_role on auth.users;
create trigger on_auth_user_created_role
  after insert on auth.users
  for each row execute function public.handle_new_user_role();

-- ==============================================================================
-- Layer 1: Row Level Security (RLS) Policies
-- ==============================================================================

-- Profiles RLS
drop policy if exists "Authenticated users can view profiles" on public.profiles;
create policy "Authenticated users can view profiles" on public.profiles
  for select using (auth.uid() is not null);

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles" on public.profiles
  for update using (public.is_admin());

-- Clients RLS
drop policy if exists "Users can view own clients" on public.clients;
drop policy if exists "Authenticated users can view clients" on public.clients;
create policy "Authenticated users can view clients" on public.clients
  for select using (auth.uid() is not null);

drop policy if exists "Users can insert own clients" on public.clients;
drop policy if exists "Only admins can insert clients" on public.clients;
create policy "Only admins can insert clients" on public.clients
  for insert with check (public.is_admin());

drop policy if exists "Users can update own clients" on public.clients;
drop policy if exists "Only admins can update clients" on public.clients;
create policy "Only admins can update clients" on public.clients
  for update using (public.is_admin());

drop policy if exists "Users can delete own clients" on public.clients;
drop policy if exists "Only admins can delete clients" on public.clients;
create policy "Only admins can delete clients" on public.clients
  for delete using (public.is_admin());

-- Transactions RLS
drop policy if exists "Users can view own transactions" on public.transactions;
drop policy if exists "Authenticated users can view transactions" on public.transactions;
create policy "Authenticated users can view transactions" on public.transactions
  for select using (auth.uid() is not null);

drop policy if exists "Users can insert own transactions" on public.transactions;
drop policy if exists "Only admins can insert transactions" on public.transactions;
drop policy if exists "Authenticated users can insert transactions" on public.transactions;
create policy "Authenticated users can insert transactions" on public.transactions
  for insert with check (auth.uid() is not null);

drop policy if exists "Users can update own transactions" on public.transactions;
drop policy if exists "Only admins can update transactions" on public.transactions;
create policy "Only admins can update transactions" on public.transactions
  for update using (public.is_admin());

drop policy if exists "Users can delete own transactions" on public.transactions;
drop policy if exists "Only admins can delete transactions" on public.transactions;
create policy "Only admins can delete transactions" on public.transactions
  for delete using (public.is_admin());
