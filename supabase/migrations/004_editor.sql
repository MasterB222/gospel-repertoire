-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run
-- Ajoute le modèle de l'éditeur (structure par sections/mesures) à `songs`
-- et la préférence de notation (solfège/lettres) à `profiles`.

alter table songs
  add column if not exists structure jsonb not null default '[]',
  add column if not exists default_time_signature text not null default '4/4',
  add column if not exists version text not null default '1.0',
  add column if not exists version_history jsonb not null default '[]';

alter table profiles
  add column if not exists note_notation text not null default 'solfege'
    check (note_notation in ('solfege', 'letters'));
