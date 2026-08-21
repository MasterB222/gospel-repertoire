-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run
-- Remplace le schéma prototype de `songs` (supabase/schema.sql) par le modèle
-- "Répertoire de base" (section 7.1 du spec) : artistes, catégories, chansons
-- enrichies. Aucune vraie donnée en prod à ce stade, remplacement direct.

drop trigger if exists songs_set_updated_at on songs;
drop table if exists songs;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  biography text default '',
  image_url text default '',
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  image_url text default '',
  created_at timestamptz not null default now()
);

create table if not exists songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist_id uuid references artists (id) on delete set null,
  category_id uuid references categories (id) on delete set null,
  language text not null default 'Français',
  original_key text default '',
  tempo text default '',
  difficulty text not null default 'Intermédiaire'
    check (difficulty in ('Facile', 'Intermédiaire', 'Avancé')),
  year int,
  album text default '',
  lyrics text default '',
  chords text default '',
  youtube_url text default '',
  cover_url text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists songs_set_updated_at on songs;
create trigger songs_set_updated_at
  before update on songs
  for each row execute function set_updated_at();

alter table artists enable row level security;
alter table categories enable row level security;
alter table songs enable row level security;

drop policy if exists "Public read access" on artists;
create policy "Public read access" on artists for select using (true);
drop policy if exists "Authenticated write access" on artists;
create policy "Authenticated write access" on artists for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Public read access" on categories;
create policy "Public read access" on categories for select using (true);
drop policy if exists "Authenticated write access" on categories;
create policy "Authenticated write access" on categories for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Public read access" on songs;
create policy "Public read access" on songs for select using (true);
drop policy if exists "Authenticated write access" on songs;
create policy "Authenticated write access" on songs for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Données de démonstration : artistes et titres fictifs, paroles/accords
-- originaux (aucune reprise de chanson protégée par droit d'auteur).

insert into artists (id, name, biography, image_url) values
  ('11111111-1111-1111-1111-111111111111', 'Josée Bantu',
   'Auteure-compositrice de louange, elle mêle influences congolaises et harmonies contemporaines.', ''),
  ('22222222-2222-2222-2222-222222222222', 'Chœur Emmanuel',
   'Chorale communautaire fondée en 2015, portée par des arrangements choraux denses et chaleureux.', '');

insert into categories (id, name, description, image_url) values
  ('33333333-3333-3333-3333-333333333333', 'Louange & Adoration',
   'Chants intimistes, tempo modéré, tournés vers la prière personnelle.', ''),
  ('44444444-4444-4444-4444-444444444444', 'Gospel africain',
   'Rythmes entraînants, appel-réponse, ancrés dans les traditions chorales africaines.', ''),
  ('55555555-5555-5555-5555-555555555555', 'Gospel traditionnel',
   'Harmonies classiques, tempo lent à modéré, héritage des negro spirituals.', '');

insert into songs (title, artist_id, category_id, language, original_key, tempo, difficulty, year, album, lyrics, chords, youtube_url, cover_url) values
(
  'Grâce Infinie',
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333',
  'Français', 'Sol majeur', '72', 'Intermédiaire', 2023, 'Lumière du Matin',
  E'Couplet 1\nDans le silence, je viens à toi\nDéposer les fardeaux de mes pas\nTa grâce infinie me relève encore\nMême quand la nuit semble la plus forte\n\nRefrain\nGrâce infinie, tu ne changes pas\nD''âge en âge, ton amour est là\nGrâce infinie, je me repose en toi\nDans tes bras je retrouve la joie\n\nCouplet 2\nCe que je n''ai pas mérité\nTu me l''offres avec tant de bonté\nAlors mon cœur choisit de chanter\nTa fidélité, jour après jour',
  E'Couplet: G - D - Em - C\nRefrain: C - G - D - Em - C - G - D - G\nPont: Em - C - G - D',
  '', ''
),
(
  'Debout Devant Toi',
  '22222222-2222-2222-2222-222222222222',
  '44444444-4444-4444-4444-444444444444',
  'Français', 'Ré majeur', '96', 'Facile', 2022, '',
  E'Couplet 1\nDebout devant toi, les mains levées\nNotre chorale vient te célébrer\nChaque voix s''unit pour proclamer\nQue tu es digne d''être loué\n\nRefrain (appel-réponse)\nLeader: Il est digne !\nChœur: Il est digne !\nLeader: Notre Roi !\nChœur: Notre Roi !\nEnsemble: Debout devant toi, on se tient aujourd''hui\n\nCouplet 2\nDe génération en génération\nTa fidélité guide la nation\nNous chantons d''une seule voix\nLa joie du salut, une fois pour toutes',
  E'Couplet: D - A - Bm - G\nRefrain: G - D - A - D\nPont: Bm - G - D - A',
  '', ''
),
(
  'Ancienne Alliance',
  '22222222-2222-2222-2222-222222222222',
  '55555555-5555-5555-5555-555555555555',
  'Français', 'Mi mineur', '64', 'Avancé', 2021, 'Racines',
  E'Couplet 1\nDans l''ancienne alliance, la promesse est née\nDe patriarches en prophètes portée\nEt jusqu''à nous, la parole a voyagé\nComme un fleuve qui n''a jamais cessé\n\nRefrain\nTiens-toi ferme, âme fidèle\nSur le roc, l''alliance est éternelle\nTiens-toi ferme, ne crains plus rien\nTa fidélité de siècle en siècle\n\nPont\nQuand vacille la voix des hommes\nTa parole reste, elle demeure\n\nCouplet 2\nAlors levons un chant de gratitude\nPour cette grâce, jamais de solitude\nD''hier à demain, la même promesse tient\nNotre espérance a un nom certain',
  E'Couplet: Em - C - G - D\nRefrain: Em - Am - Em - B7 - Em\nPont: C - D - Em',
  '', ''
);
