-- =============================================
-- APEX — Supabase Schema
-- Paste this into: Supabase > SQL Editor > Run
-- =============================================

-- Categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#F59E0B',
  created_at timestamptz default now()
);

-- Expenses table
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(12, 2) not null,
  category_id uuid references public.categories(id) on delete set null,
  category_name text not null,
  category_color text not null default '#F59E0B',
  month_key text not null, -- format: "YYYY-MM"
  date timestamptz default now(),
  created_at timestamptz default now()
);

-- Budgets table (one per user per month)
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_key text not null, -- format: "YYYY-MM"
  amount numeric(12, 2) not null default 0,
  created_at timestamptz default now(),
  unique(user_id, month_key)
);

-- =============================================
-- Row Level Security (RLS)
-- Each user can only see/modify their own rows
-- =============================================

alter table public.categories enable row level security;
alter table public.expenses enable row level security;
alter table public.budgets enable row level security;

-- Categories policies
create policy "Users can view own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- Expenses policies
create policy "Users can view own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- Budgets policies
create policy "Users can view own budgets"
  on public.budgets for select
  using (auth.uid() = user_id);

create policy "Users can insert own budgets"
  on public.budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own budgets"
  on public.budgets for update
  using (auth.uid() = user_id);

create policy "Users can delete own budgets"
  on public.budgets for delete
  using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists expenses_user_month on public.expenses(user_id, month_key);
create index if not exists categories_user on public.categories(user_id);
create index if not exists budgets_user_month on public.budgets(user_id, month_key);
