-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run
-- Resserre les policies RLS "Authenticated write access" (n'importe quel
-- compte connecté pouvait tout modifier) selon le rôle métier réel, sans
-- casser l'édition collaborative de chansons ni l'auto-complétion de tâches.

create or replace function has_role(allowed text[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = any(allowed)
  );
$$;

-- Chansons / artistes / catégories : la création et la suppression sont des
-- actions de catalogue réservées à l'admin (déjà le cas dans l'interface,
-- maintenant vérifié aussi côté base). La modification reste ouverte à tout
-- utilisateur connecté : c'est ce dont a besoin l'éditeur collaboratif de
-- structure (accords/paroles/portée), utilisable par tous les membres.

drop policy if exists "Authenticated write access" on songs;
drop policy if exists "Songs insert admin" on songs;
create policy "Songs insert admin" on songs for insert with check (has_role(array['admin']));
drop policy if exists "Songs update authenticated" on songs;
create policy "Songs update authenticated" on songs for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "Songs delete admin" on songs;
create policy "Songs delete admin" on songs for delete using (has_role(array['admin']));

drop policy if exists "Authenticated write access" on artists;
drop policy if exists "Artists write admin" on artists;
create policy "Artists write admin" on artists for all
  using (has_role(array['admin'])) with check (has_role(array['admin']));

drop policy if exists "Authenticated write access" on categories;
drop policy if exists "Categories write admin" on categories;
create policy "Categories write admin" on categories for all
  using (has_role(array['admin'])) with check (has_role(array['admin']));

-- Groupes : gérer la composition de la chorale est une tâche de direction.
drop policy if exists "Authenticated write access" on groups;
drop policy if exists "Groups write leadership" on groups;
create policy "Groups write leadership" on groups for all
  using (has_role(array['admin', 'chef_choeur'])) with check (has_role(array['admin', 'chef_choeur']));

drop policy if exists "Authenticated write access" on group_members;
drop policy if exists "Group members write leadership" on group_members;
create policy "Group members write leadership" on group_members for all
  using (has_role(array['admin', 'chef_choeur'])) with check (has_role(array['admin', 'chef_choeur']));

-- Assignations : créer/supprimer une tâche est une décision de direction ;
-- la personne (ou un membre du groupe) à qui elle est confiée doit pouvoir
-- la mettre à jour elle-même (ex. bouton "Marquer comme terminé").
drop policy if exists "Authenticated write access" on assignments;
drop policy if exists "Assignments insert leadership" on assignments;
create policy "Assignments insert leadership" on assignments for insert
  with check (has_role(array['admin', 'chef_choeur']));
drop policy if exists "Assignments update leadership or assignee" on assignments;
create policy "Assignments update leadership or assignee" on assignments for update
  using (
    has_role(array['admin', 'chef_choeur'])
    or assignee_user_id = auth.uid()
    or exists (
      select 1 from group_members gm
      where gm.group_id = assignments.assignee_group_id and gm.profile_id = auth.uid()
    )
  );
drop policy if exists "Assignments delete leadership" on assignments;
create policy "Assignments delete leadership" on assignments for delete
  using (has_role(array['admin', 'chef_choeur']));

-- Commentaires : tout le monde peut participer à la discussion, mais seul
-- l'auteur (ou un admin) peut modifier/supprimer un commentaire existant —
-- jusqu'ici n'importe qui pouvait éditer le commentaire de n'importe qui.
drop policy if exists "Authenticated write access" on comments;
drop policy if exists "Comments insert authenticated" on comments;
create policy "Comments insert authenticated" on comments for insert
  with check (auth.role() = 'authenticated');
drop policy if exists "Comments update own or admin" on comments;
create policy "Comments update own or admin" on comments for update
  using (author_id = auth.uid() or has_role(array['admin']));
drop policy if exists "Comments delete own or admin" on comments;
create policy "Comments delete own or admin" on comments for delete
  using (author_id = auth.uid() or has_role(array['admin']));

-- Événements et programme : planifier une répétition/un culte est une
-- tâche de direction.
drop policy if exists "Authenticated write access" on events;
drop policy if exists "Events write leadership" on events;
create policy "Events write leadership" on events for all
  using (has_role(array['admin', 'chef_choeur'])) with check (has_role(array['admin', 'chef_choeur']));

drop policy if exists "Authenticated write access" on event_program;
drop policy if exists "Event program write leadership" on event_program;
create policy "Event program write leadership" on event_program for all
  using (has_role(array['admin', 'chef_choeur'])) with check (has_role(array['admin', 'chef_choeur']));

-- Checklist d'événement : ajouter/retirer une tâche est une décision de
-- direction, mais la personne assignée doit pouvoir cocher son propre statut.
drop policy if exists "Authenticated write access" on event_checklist;
drop policy if exists "Checklist insert leadership" on event_checklist;
create policy "Checklist insert leadership" on event_checklist for insert
  with check (has_role(array['admin', 'chef_choeur']));
drop policy if exists "Checklist update leadership or assignee" on event_checklist;
create policy "Checklist update leadership or assignee" on event_checklist for update
  using (has_role(array['admin', 'chef_choeur']) or assigned_to = auth.uid());
drop policy if exists "Checklist delete leadership" on event_checklist;
create policy "Checklist delete leadership" on event_checklist for delete
  using (has_role(array['admin', 'chef_choeur']));
