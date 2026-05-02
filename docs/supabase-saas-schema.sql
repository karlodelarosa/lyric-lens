-- Multi-tenant SaaS baseline for Lyric Lens
-- Applied to project: inljfpumljyjjjkiprve

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  plan text not null default 'starter' check (plan in ('starter','growth','enterprise')),
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.company_memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  status text not null default 'active' check (status in ('active','invited','disabled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_id, user_id)
);

alter table public.profiles
  add column if not exists current_company_id uuid references public.companies(id) on delete set null;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  provider text not null default 'manual' check (provider in ('manual','stripe','paypal')),
  provider_customer_id text,
  provider_subscription_id text,
  plan_code text not null default 'starter' check (plan_code in ('starter','growth','enterprise')),
  status text not null default 'trialing' check (status in ('trialing','active','past_due','canceled','incomplete')),
  amount_cents integer not null default 0 check (amount_cents >= 0),
  currency text not null default 'usd',
  billing_interval text not null default 'month' check (billing_interval in ('month','year')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.songs
  add column if not exists company_id uuid references public.companies(id) on delete cascade;

alter table public.companies enable row level security;
alter table public.company_memberships enable row level security;
alter table public.subscriptions enable row level security;

create unique index if not exists subscriptions_provider_subscription_id_key
  on public.subscriptions(provider_subscription_id)
  where provider_subscription_id is not null;

create unique index if not exists subscriptions_one_active_per_company_idx
  on public.subscriptions(company_id)
  where status in ('trialing','active','past_due','incomplete');

create index if not exists songs_company_id_idx on public.songs(company_id);

insert into public.companies (slug, name, plan)
values ('lyric-lens-demo', 'Lyric Lens Demo Church', 'starter')
on conflict (slug) do nothing;
