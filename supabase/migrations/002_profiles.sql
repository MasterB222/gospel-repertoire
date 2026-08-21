-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run
-- Ajoute la table des profils utilisateurs (rôle déclaré à l'inscription).

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  role text not null default 'utilisateur'
    check (role in ('admin', 'chef_choeur', 'musicien', 'chanteur', 'choriste', 'utilisateur')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "Users manage their own profile" on profiles;
create policy "Users manage their own profile"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Crée automatiquement le profil à l'inscription, à partir des métadonnées
-- passées dans `options.data` lors de supabase.auth.signUp().
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'utilisateur')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
