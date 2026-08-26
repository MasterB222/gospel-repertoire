-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run
-- Planification d'événements : répétitions, concerts, cultes, avec programme et checklist.

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  event_date timestamptz not null,
  location text default '',
  type text not null default 'repetition'
    check (type in ('repetition', 'concert', 'culte', 'autre')),
  cover_url text default '',
  status text not null default 'brouillon'
    check (status in ('brouillon', 'publie', 'termine', 'annule')),
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists event_program (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events (id) on delete cascade,
  song_id uuid references songs (id) on delete cascade,
  position int not null default 0,
  key_signature text default '',
  stage_notes text default '',
  unique (event_id, song_id)
);

create table if not exists event_checklist (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events (id) on delete cascade,
  item text not null,
  assigned_to uuid references profiles (id),
  status text not null default 'a_faire'
    check (status in ('a_faire', 'en_cours', 'fait')),
  due_date timestamptz,
  created_at timestamptz not null default now()
);

drop trigger if exists events_set_updated_at on events;
create trigger events_set_updated_at
  before update on events
  for each row execute function set_updated_at();

alter table events enable row level security;
alter table event_program enable row level security;
alter table event_checklist enable row level security;

drop policy if exists "Public read access" on events;
create policy "Public read access" on events for select using (true);
drop policy if exists "Authenticated write access" on events;
create policy "Authenticated write access" on events for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Public read access" on event_program;
create policy "Public read access" on event_program for select using (true);
drop policy if exists "Authenticated write access" on event_program;
create policy "Authenticated write access" on event_program for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Public read access" on event_checklist;
create policy "Public read access" on event_checklist for select using (true);
drop policy if exists "Authenticated write access" on event_checklist;
create policy "Authenticated write access" on event_checklist for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
