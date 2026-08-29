-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run
-- Photo de profil : colonne avatar_url + bucket de stockage dédié.

alter table profiles add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Chaque utilisateur stocke ses fichiers sous un dossier nommé par son id
-- (ex. "<user_id>/photo.jpg"), ce qui permet de restreindre l'écriture au
-- propriétaire tout en gardant la lecture publique (photo affichée à tous).
drop policy if exists "Avatars public read" on storage.objects;
create policy "Avatars public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Avatars owner insert" on storage.objects;
create policy "Avatars owner insert"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Avatars owner update" on storage.objects;
create policy "Avatars owner update"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Avatars owner delete" on storage.objects;
create policy "Avatars owner delete"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
