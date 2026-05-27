create table if not exists public.quote_requests (
  id uuid primary key,
  name text not null,
  email text not null,
  phone text not null default '',
  services text[] not null default '{}',
  message text not null,
  language text not null default 'en',
  email_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists quote_requests_created_at_idx
  on public.quote_requests (created_at desc);

alter table public.quote_requests enable row level security;

drop policy if exists "Service role can manage quote requests"
  on public.quote_requests;

create policy "Service role can manage quote requests"
  on public.quote_requests
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
