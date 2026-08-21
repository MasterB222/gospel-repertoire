-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run
-- Administration (Phase 7) : statut brouillon/publié, tags, description,
-- lien de partition sur les chansons ; accès admin complet sur les profils.

alter table songs
  add column if not exists status text not null default 'publie'
    check (status in ('brouillon', 'publie')),
  add column if not exists tags text[] not null default '{}',
  add column if not exists description text default '',
  add column if not exists partition_url text default '';

drop policy if exists "Admins manage all profiles" on profiles;
create policy "Admins manage all profiles"
  on profiles for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
