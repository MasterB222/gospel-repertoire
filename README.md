# Répertoire Gospel

Atelier musical gospel collaboratif : répertoire, éditeur de chansons (accords, portée, piano virtuel), assignations, calendrier d'événements et administration, pour un groupe (chef de chœur, musiciens, chanteurs, choristes).

Stack : React + TypeScript + Tailwind CSS (Vite) côté client, Supabase (Postgres + Auth + Realtime + Storage) côté backend. Pensé pour une trentaine d'utilisateurs, entièrement sur les paliers gratuits.

## Fonctionnalités

**Authentification & rôles** — inscription/connexion/mot de passe oublié, 6 rôles (`admin`, `chef_choeur`, `musicien`, `chanteur`, `choriste`, `utilisateur`), profil auto-créé à l'inscription, compte désactivable par un admin (déconnexion forcée).

**Répertoire** — chansons avec artiste, catégorie, tonalité, tempo, difficulté, paroles, lien YouTube, tags, statut brouillon/publié ; recherche, exploration par catégorie/artiste, upload direct de partition PDF.

**Éditeur de chansons** — structure en sections/mesures avec accords, paroles, annotations et repères Nashville ; transposition d'accords/tonalité (lettres, solfège ou degrés Nashville) ; undo/redo, sauvegarde automatique versionnée ; présence collaborative en temps réel ; onglet "Portée" avec clavier piano virtuel, écriture de mélodie en temps réel sur une portée (VexFlow), métronome et lecture audio.

**Modes de restitution** — Répétition (navigation mesure par mesure, défilement auto, métronome), Présentation (paroles en grand pour projection), Apprentissage (lié à une assignation, fil de commentaires).

**Collaboration** — groupes vocaux/instrumentaux, assignations de tâches (chanson/section/mesure → personne ou groupe) avec statut et suivi, commentaires ancrés.

**Calendrier & événements** — vue mensuelle, création d'événements (répétition/concert/culte), programme de chants avec tonalité spécifique, checklist pré-événement assignable.

**Compte utilisateur** — favoris, playlists, historique d'écoute, lecteur global (file d'attente, YouTube intégré, shuffle/repeat).

**Administration** — dashboard (statistiques, utilisateurs en ligne en temps réel), CRUD chansons/artistes/catégories, création/désactivation/suppression de comptes utilisateurs.

## Étapes de mise en route

### 1. Supabase (base de données)

1. Crée un compte sur https://supabase.com (gratuit, connexion possible via GitHub).
2. Crée un nouveau projet (choisis une région proche, note le mot de passe DB généré).
3. Onglet **SQL Editor** > New query > exécute **dans l'ordre**, un fichier à la fois :
   - [`supabase/schema.sql`](supabase/schema.sql) — extension `pgcrypto` (nécessaire à toute la suite)
   - [`supabase/migrations/002_profiles.sql`](supabase/migrations/002_profiles.sql) à [`012_role_based_policies.sql`](supabase/migrations/012_role_based_policies.sql), dans l'ordre numérique
4. Onglet **Storage** : vérifie que le bucket `partitions` a bien été créé par la migration 011 (public en lecture).
5. Onglet **Project Settings > API** : récupère `Project URL` et la clé `anon public`.
6. Si tu veux la suppression définitive de compte utilisateur (fonctionnalité admin), déploie aussi [`supabase/functions/delete-user`](supabase/functions/delete-user) via **Edge Functions > New function** (copier-coller le code, pas besoin de CLI).

### 2. Configuration locale

```bash
cp .env.example .env
```

Remplis `.env` avec les valeurs récupérées à l'étape précédente :

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxx
```

Puis :

```bash
npm install
npm run dev
```

Ouvre l'URL affichée (http://localhost:5173). Crée un compte via **Inscription** (avec ton rôle : chanteur, musicien, chef de chœur...). Le premier compte admin se déclare en modifiant manuellement sa ligne dans la table `profiles` (colonne `role`) via le SQL Editor de Supabase — ensuite, la gestion des rôles se fait depuis `/admin/users`.

### 3. Déploiement (gratuit, sans nom de domaine à payer)

1. Pousse ce projet sur GitHub (dépôt vide à créer sur github.com, puis) :
   ```bash
   git remote add origin https://github.com/<ton-compte>/gospel-repertoire.git
   git push -u origin main
   ```
2. Crée un compte sur https://vercel.com (bouton **Continue with GitHub**, aucune inscription séparée nécessaire).
3. **Add New > Project**, sélectionne le dépôt `gospel-repertoire`.
4. Dans **Environment Variables**, ajoute `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` avec les mêmes valeurs que ton `.env`.
5. **Deploy**. Tu obtiens une URL gratuite du type `gospel-repertoire.vercel.app` à partager avec le groupe.

Chaque `git push` vers `main` redéploie automatiquement le site. [`vercel.json`](vercel.json) redirige toutes les routes vers `index.html` — nécessaire pour que le routage côté client (React Router) fonctionne sur un lien direct ou un rafraîchissement de page.

## Structure

- `src/main.tsx`, `src/App.tsx` — point d'entrée, providers globaux (thème, toasts, auth, présence, lecteur)
- `src/router.tsx` — toutes les routes de l'app, avec chargement différé (`React.lazy`) pour l'éditeur, les modes plein écran et l'administration
- `src/context/` — `AuthContext`, `ThemeContext`, `ToastContext`, `PresenceContext`
- `src/components/ui/` — composants de base réutilisables (Button, Card, Modal, Toast, Skeleton, EmptyState)
- `src/components/editor/`, `src/components/notation/` — éditeur de structure (grille d'accords) et portée/piano
- `src/components/events/` — calendrier et formulaires d'événements
- `src/components/collaboration/` — assignations, commentaires
- `src/components/admin/` — formulaires CRUD admin
- `src/lib/` — logique métier : `music.ts` (transposition, notations), `notation.ts` (portée, audio), `events.ts`, `collaboration.ts`, `admin.ts`, `storage.ts`
- `src/routes/` — pages, dont `auth/`, `songs/`, `events/`, `admin/`
- `supabase/schema.sql`, `supabase/migrations/` — schéma de la base et règles de sécurité (RLS), dans l'ordre d'exécution
- `supabase/functions/` — Edge Function pour la suppression définitive de compte

## Sécurité (RLS Supabase)

- Lecture publique sur la plupart des tables (chansons, artistes, catégories, groupes, assignations, événements...).
- Écriture différenciée par rôle métier (migration 012) :
  - Créer/supprimer une chanson, un artiste ou une catégorie : réservé aux admins. Modifier la structure d'une chanson (éditeur collaboratif) : ouvert à tout utilisateur connecté.
  - Créer/gérer des groupes, des assignations, des événements et leur programme : réservé à `admin` et `chef_choeur`. Mettre à jour le statut d'une assignation ou d'une tâche de checklist : possible aussi par la personne (ou le groupe) à qui elle est confiée.
  - Commentaires : tout le monde peut en ajouter, seul l'auteur (ou un admin) peut modifier/supprimer le sien.
- Favoris, playlists, historique : accès strictement propriétaire (`auth.uid() = user_id`).
- Profils : chacun gère le sien ; un admin gère tous les profils (fonction `is_admin()` en `security definer` pour éviter la récursion RLS).

## Limites connues

- Pas de tests automatisés dans le dépôt.
- La recherche de membre par nom (`searchProfiles`, utilisée pour les assignations et la checklist d'événement) ne renvoie des résultats que pour un admin : les RLS sur `profiles` empêchent un utilisateur normal de voir le nom des autres membres.
- La transposition d'accords (`lib/music.ts`) ne gère pas les accords diminués notés `°` ni les altérations non standard : un accord mal formé est retourné tel quel, sans erreur.
