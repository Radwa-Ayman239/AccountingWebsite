-- SUPERSEDED. Do not run this file. Use 003_full_production_schema.sql instead.
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Clients table
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  contact_info text default '',
  project_status text default 'active' check (project_status in ('active', 'completed', 'on_hold', 'cancelled')),
  notes text default '',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Transactions table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  date date not null default current_date,
  type text not null check (type in ('income', 'expense')),
  category text not null default 'other' check (category in ('client_supplies', 'overhead', 'software', 'transport', 'services', 'materials', 'other')),
  description text default '',
  amount numeric(12,2) not null default 0,
  payment_status text default 'pending' check (payment_status in ('paid', 'pending', 'overdue')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- User settings table
create table public.user_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  currency text default 'EGP' check (currency in ('EGP', 'SAR', 'AED', 'USD', 'EUR')),
  locale text default 'ar' check (locale in ('ar', 'en')),
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes
create index idx_clients_user_id on public.clients(user_id);
create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_client_id on public.transactions(client_id);
create index idx_transactions_date on public.transactions(date);
create index idx_transactions_type on public.transactions(type);
create index idx_transactions_category on public.transactions(category);

-- Row Level Security
alter table public.clients enable row level security;
alter table public.transactions enable row level security;
alter table public.user_settings enable row level security;

-- RLS Policies - Clients
create policy "Users can view own clients" on public.clients
  for select using (auth.uid() = user_id);
create policy "Users can insert own clients" on public.clients
  for insert with check (auth.uid() = user_id);
create policy "Users can update own clients" on public.clients
  for update using (auth.uid() = user_id);
create policy "Users can delete own clients" on public.clients
  for delete using (auth.uid() = user_id);

-- RLS Policies - Transactions
create policy "Users can view own transactions" on public.transactions
  for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions
  for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on public.transactions
  for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on public.transactions
  for delete using (auth.uid() = user_id);

-- RLS Policies - User Settings
create policy "Users can view own settings" on public.user_settings
  for select using (auth.uid() = user_id);
create policy "Users can insert own settings" on public.user_settings
  for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on public.user_settings
  for update using (auth.uid() = user_id);

-- Updated at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger set_clients_updated_at
  before update on public.clients
  for each row execute function public.handle_updated_at();

create trigger set_transactions_updated_at
  before update on public.transactions
  for each row execute function public.handle_updated_at();

create trigger set_user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.handle_updated_at();

-- Function to auto-create user settings on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_settings (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create settings for new users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
