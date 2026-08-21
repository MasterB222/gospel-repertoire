-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run

create extension if not exists pgcrypto;

create table if not exists songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  key text default '',
  tempo text default '',
  style text default '',
  origin text default '',
  status text not null default 'À apprendre',
  sections jsonb not null default '[]'::jsonb,
  indications text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Maintient updated_at à jour automatiquement
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists songs_set_updated_at on songs;
create trigger songs_set_updated_at
  before update on songs
  for each row execute function set_updated_at();

-- Sécurité : lecture publique, écriture réservée aux utilisateurs connectés (l'admin)
alter table songs enable row level security;

drop policy if exists "Public read access" on songs;
create policy "Public read access"
  on songs for select
  using (true);

drop policy if exists "Authenticated write access" on songs;
create policy "Authenticated write access"
  on songs for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
