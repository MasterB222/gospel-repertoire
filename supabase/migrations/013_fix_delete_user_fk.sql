-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run
-- Corrige la suppression de compte utilisateur ("Database error deleting user") :
-- plusieurs clés étrangères vers profiles(id) n'avaient pas de règle ON DELETE,
-- ce qui bloque Postgres tant que l'utilisateur a créé une assignation, un
-- commentaire, un événement, ou s'est vu assigner une tâche de checklist.
-- Passées en ON DELETE SET NULL : le contenu reste (l'assignation, le
-- commentaire, l'événement...), seule l'attribution à cette personne disparaît,
-- plutôt que de tout supprimer en cascade.

alter table assignments drop constraint if exists assignments_created_by_fkey;
alter table assignments add constraint assignments_created_by_fkey
  foreign key (created_by) references profiles (id) on delete set null;

alter table comments drop constraint if exists comments_author_id_fkey;
alter table comments add constraint comments_author_id_fkey
  foreign key (author_id) references profiles (id) on delete set null;

alter table events drop constraint if exists events_created_by_fkey;
alter table events add constraint events_created_by_fkey
  foreign key (created_by) references profiles (id) on delete set null;

alter table event_checklist drop constraint if exists event_checklist_assigned_to_fkey;
alter table event_checklist add constraint event_checklist_assigned_to_fkey
  foreign key (assigned_to) references profiles (id) on delete set null;
