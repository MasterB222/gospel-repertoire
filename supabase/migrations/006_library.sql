-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run
-- Favoris, playlists et historique (Phase 6 : Compte utilisateur).

create table if not exists favorites (
  user_id uuid references profiles (id) on delete cascade,
  song_id uuid references songs (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, song_id)
);

create table if not exists playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade,
  name text not null,
  description text default '',
  cover_url text default '',
  created_at timestamptz not null default now()
);

create table if not exists playlist_songs (
  playlist_id uuid references playlists (id) on delete cascade,
  song_id uuid references songs (id) on delete cascade,
  position int not null default 0,
  added_at timestamptz not null default now(),
  primary key (playlist_id, song_id)
);

create table if not exists history (
  user_id uuid references profiles (id) on delete cascade,
  song_id uuid references songs (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (user_id, song_id)
);

alter table favorites enable row level security;
alter table playlists enable row level security;
alter table playlist_songs enable row level security;
alter table history enable row level security;

drop policy if exists "Owner access" on favorites;
create policy "Owner access" on favorites for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Owner access" on playlists;
create policy "Owner access" on playlists for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Owner access via playlist" on playlist_songs;
create policy "Owner access via playlist" on playlist_songs for all
  using (exists (select 1 from playlists p where p.id = playlist_id and p.user_id = auth.uid()))
  with check (exists (select 1 from playlists p where p.id = playlist_id and p.user_id = auth.uid()));

drop policy if exists "Owner access" on history;
create policy "Owner access" on history for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
