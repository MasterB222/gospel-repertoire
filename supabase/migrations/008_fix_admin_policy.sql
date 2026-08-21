-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run
-- Corrige la récursion infinie de la politique "Admins manage all profiles"
-- (007_admin.sql) : une politique RLS sur `profiles` ne peut pas interroger
-- `profiles` directement dans sa propre condition sans re-déclencher RLS à
-- l'infini. On passe par une fonction SECURITY DEFINER qui contourne RLS
-- pour ce contrôle précis (pattern standard Supabase).

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "Admins manage all profiles" on profiles;
create policy "Admins manage all profiles"
  on profiles for all
  using (is_admin())
  with check (is_admin());
