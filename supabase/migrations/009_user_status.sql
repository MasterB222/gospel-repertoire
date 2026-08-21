-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run
-- Ajoute le statut actif/désactivé sur les profils (gestion utilisateurs admin).

alter table profiles
  add column if not exists active boolean not null default true;
