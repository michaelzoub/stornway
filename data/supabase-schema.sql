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

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  address text,
  city text,
  province text not null default 'QC',
  postal_code text,
  client_type text not null default 'residential'
    check (client_type in ('residential', 'commercial')),
  status text not null default 'lead'
    check (status in ('lead', 'active', 'recurring', 'inactive')),
  source text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email),
  unique (phone)
);

create index if not exists clients_name_idx
  on public.clients (lower(name));

create index if not exists clients_status_idx
  on public.clients (status);

alter table public.clients enable row level security;

drop policy if exists "Service role can manage clients"
  on public.clients;

create policy "Service role can manage clients"
  on public.clients
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

alter table public.quote_requests
  add column if not exists client_id uuid references public.clients(id) on delete set null;

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text not null unique,
  client_id uuid references public.clients(id) on delete set null,
  quote_request_id uuid references public.quote_requests(id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired')),
  service_type text not null default 'general',
  sent_at timestamptz,
  accepted_at timestamptz,
  expires_at date,
  subtotal numeric(12, 2) not null default 0,
  tax_total numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quotes_client_id_idx
  on public.quotes (client_id);

create index if not exists quotes_status_idx
  on public.quotes (status);

create index if not exists quotes_accepted_at_idx
  on public.quotes (accepted_at desc)
  where status = 'accepted';

alter table public.quotes enable row level security;

drop policy if exists "Service role can manage quotes"
  on public.quotes;

create policy "Service role can manage quotes"
  on public.quotes
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create table if not exists public.quote_line_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  product_service text not null,
  description text not null default '',
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(12, 2) not null default 0,
  line_total numeric(12, 2) generated always as (quantity * unit_price) stored,
  sort_order integer not null default 0
);

create index if not exists quote_line_items_quote_id_idx
  on public.quote_line_items (quote_id, sort_order);

alter table public.quote_line_items enable row level security;

drop policy if exists "Service role can manage quote line items"
  on public.quote_line_items;

create policy "Service role can manage quote line items"
  on public.quote_line_items
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  quote_id uuid references public.quotes(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'void')),
  issued_at date not null default current_date,
  due_at date,
  subtotal numeric(12, 2) not null default 0,
  tax_total numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  amount_paid numeric(12, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_client_id_idx
  on public.invoices (client_id);

create index if not exists invoices_status_idx
  on public.invoices (status);

create index if not exists invoices_due_at_idx
  on public.invoices (due_at);

alter table public.invoices enable row level security;

drop policy if exists "Service role can manage invoices"
  on public.invoices;

create policy "Service role can manage invoices"
  on public.invoices
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create table if not exists public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  product_service text not null,
  description text not null default '',
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(12, 2) not null default 0,
  line_total numeric(12, 2) generated always as (quantity * unit_price) stored,
  sort_order integer not null default 0
);

create index if not exists invoice_line_items_invoice_id_idx
  on public.invoice_line_items (invoice_id, sort_order);

alter table public.invoice_line_items enable row level security;

drop policy if exists "Service role can manage invoice line items"
  on public.invoice_line_items;

create policy "Service role can manage invoice line items"
  on public.invoice_line_items
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
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

drop trigger if exists clients_set_updated_at on public.clients;

create trigger clients_set_updated_at
  before update on public.clients
  for each row
  execute function public.set_updated_at();

drop trigger if exists quotes_set_updated_at on public.quotes;

create trigger quotes_set_updated_at
  before update on public.quotes
  for each row
  execute function public.set_updated_at();

drop trigger if exists invoices_set_updated_at on public.invoices;

create trigger invoices_set_updated_at
  before update on public.invoices
  for each row
  execute function public.set_updated_at();
