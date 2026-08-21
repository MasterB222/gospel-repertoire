-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run
-- Groupes, assignations et commentaires (Phase 4 : Collaboration & assignations).

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  created_at timestamptz not null default now()
);

create table if not exists group_members (
  group_id uuid references groups (id) on delete cascade,
  profile_id uuid references profiles (id) on delete cascade,
  part text default '',
  joined_at timestamptz not null default now(),
  primary key (group_id, profile_id)
);

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  song_id uuid references songs (id) on delete cascade,
  section_id text,
  measure_number int,
  assignee_group_id uuid references groups (id) on delete cascade,
  assignee_user_id uuid references profiles (id) on delete cascade,
  part text default '',
  status text not null default 'a_faire'
    check (status in ('a_faire', 'en_cours', 'termine', 'a_revoir')),
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (assignee_group_id is not null or assignee_user_id is not null)
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  song_id uuid references songs (id) on delete cascade,
  section_id text,
  measure_number int,
  author_id uuid references profiles (id),
  text text not null,
  created_at timestamptz not null default now()
);

drop trigger if exists assignments_set_updated_at on assignments;
create trigger assignments_set_updated_at
  before update on assignments
  for each row execute function set_updated_at();

alter table groups enable row level security;
alter table group_members enable row level security;
alter table assignments enable row level security;
alter table comments enable row level security;

drop policy if exists "Public read access" on groups;
create policy "Public read access" on groups for select using (true);
drop policy if exists "Authenticated write access" on groups;
create policy "Authenticated write access" on groups for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Public read access" on group_members;
create policy "Public read access" on group_members for select using (true);
drop policy if exists "Authenticated write access" on group_members;
create policy "Authenticated write access" on group_members for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Public read access" on assignments;
create policy "Public read access" on assignments for select using (true);
drop policy if exists "Authenticated write access" on assignments;
create policy "Authenticated write access" on assignments for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Public read access" on comments;
create policy "Public read access" on comments for select using (true);
drop policy if exists "Authenticated write access" on comments;
create policy "Authenticated write access" on comments for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Données de démonstration : un groupe avec le compte de test comme membre.
insert into groups (id, name, description) values
  ('66666666-6666-6666-6666-666666666666', 'Chorale Bethel',
   'Groupe de démonstration pour tester assignations et suivi.')
on conflict (id) do nothing;

insert into group_members (group_id, profile_id, part)
select '66666666-6666-6666-6666-666666666666', id, 'Direction'
from profiles
where role = 'chef_choeur'
on conflict do nothing;
