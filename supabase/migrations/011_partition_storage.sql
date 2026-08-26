-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run
-- Bucket de stockage pour l'upload direct des fichiers PDF de partition
-- (jusqu'ici, seul un lien externe pouvait être renseigné).

insert into storage.buckets (id, name, public)
values ('partitions', 'partitions', true)
on conflict (id) do nothing;

drop policy if exists "Partitions public read" on storage.objects;
create policy "Partitions public read"
  on storage.objects for select
  using (bucket_id = 'partitions');

drop policy if exists "Partitions authenticated insert" on storage.objects;
create policy "Partitions authenticated insert"
  on storage.objects for insert
  with check (bucket_id = 'partitions' and auth.role() = 'authenticated');

drop policy if exists "Partitions authenticated update" on storage.objects;
create policy "Partitions authenticated update"
  on storage.objects for update
  using (bucket_id = 'partitions' and auth.role() = 'authenticated');

drop policy if exists "Partitions authenticated delete" on storage.objects;
create policy "Partitions authenticated delete"
  on storage.objects for delete
  using (bucket_id = 'partitions' and auth.role() = 'authenticated');
