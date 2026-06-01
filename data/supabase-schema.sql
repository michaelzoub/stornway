-- Stornway Supabase schema
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  services text[] not null default '{}',
  message text not null,
  language text not null default 'en' check (language in ('en', 'fr')),
  email_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists quote_requests_created_at_idx
  on public.quote_requests (created_at desc);

create index if not exists quote_requests_email_idx
  on public.quote_requests (lower(email));

alter table public.quote_requests enable row level security;

drop policy if exists "Service role can manage quote requests"
  on public.quote_requests;

create policy "Service role can manage quote requests"
  on public.quote_requests
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  client_name text,
  client_email text,
  client_phone text,
  address text,
  city text,
  postal_code text,
  job_type text,
  status text not null default 'completed'
    check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  completed_date date,
  rating integer check (rating between 1 and 5),
  review text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_created_at_idx
  on public.jobs (created_at desc);

create index if not exists jobs_completed_date_idx
  on public.jobs (completed_date desc);

create index if not exists jobs_review_idx
  on public.jobs (rating)
  where rating is not null or review is not null;

alter table public.jobs enable row level security;

drop policy if exists "Service role can manage jobs"
  on public.jobs;

create policy "Service role can manage jobs"
  on public.jobs
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists jobs_set_updated_at on public.jobs;

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row
  execute function public.set_updated_at();
