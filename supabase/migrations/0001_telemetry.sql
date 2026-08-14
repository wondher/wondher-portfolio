-- supabase/migrations/0001_telemetry.sql

-- Snapshot de telemetria do estúdio (alimenta chips da navbar)
create table if not exists public.studio_telemetry (
  id smallint primary key default 1 check (id = 1),   -- singleton
  uptime_pct numeric(5,2) not null default 99.98,
  deploys_30d integer not null default 0,
  active_pipelines integer not null default 0,
  last_commit_sha text,
  updated_at timestamptz not null default now()
);

-- Contatos vindos do terminal footer
create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  company text,
  message text not null check (char_length(message) between 10 and 4000),
  source text not null default 'terminal-footer',
  created_at timestamptz not null default now()
);

alter table public.studio_telemetry enable row level security;
alter table public.contact_inquiries enable row level security;

-- Telemetria: leitura pública, escrita apenas service_role (via CI/webhook de deploy)
create policy "telemetry_read_anon" on public.studio_telemetry
  for select to anon using (true);

-- Contato: insert público (rate limit na route handler), leitura apenas service_role
create policy "inquiry_insert_anon" on public.contact_inquiries
  for insert to anon with check (true);
