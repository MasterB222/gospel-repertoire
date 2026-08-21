# Répertoire Gospel

Atelier musical gospel collaboratif : répertoire, éditeur de chansons, assignations et suivi d'apprentissage pour un groupe (chef de chœur, musiciens, chanteurs).

Stack : React + TypeScript + Tailwind CSS (Vite) côté client, Supabase (Postgres + Auth) côté backend.

**État actuel : Phase 1 — Fondations.** Architecture, design system, layout responsive et authentification de base sont en place. Le répertoire, l'éditeur de chansons, les assignations et l'administration arrivent dans les phases suivantes (voir les écrans marqués « TODO placeholder » dans l'app).

## Étapes de mise en route

### 1. Supabase (base de données)

1. Crée un compte sur https://supabase.com (gratuit, connexion possible via GitHub).
2. Crée un nouveau projet (choisis une région proche, note le mot de passe DB généré).
3. Onglet **SQL Editor** > New query > exécute dans l'ordre :
   - [`supabase/schema.sql`](supabase/schema.sql) — table `songs` (héritée de la version précédente, sera enrichie en Phase 2)
   - [`supabase/migrations/002_profiles.sql`](supabase/migrations/002_profiles.sql) — table `profiles` (rôle déclaré à l'inscription) + création automatique du profil au signup
4. Onglet **Project Settings > API** : récupère `Project URL` et la clé `anon public`.

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

Ouvre l'URL affichée (http://localhost:5173). Crée un compte via **Inscription** (avec ton rôle : chanteur, musicien, chef de chœur...).

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

Chaque `git push` vers `main` redéploie automatiquement le site.

## Structure

- `src/main.tsx`, `src/App.tsx` — point d'entrée, providers globaux (thème, toasts, auth)
- `src/router.tsx` — toutes les routes de l'app ; celles non encore construites pointent vers un écran `TODO placeholder`
- `src/context/` — `AuthContext` (session + profil Supabase), `ThemeContext` (clair/sombre), `ToastContext`
- `src/components/ui/` — composants de base réutilisables (Button, Card, Modal, Toast, Skeleton, EmptyState)
- `src/components/layout/` — Sidebar (desktop), MobileNavbar, Header, AppLayout
- `src/routes/` — pages, dont `auth/` (login, register, mot de passe oublié)
- `src/lib/supabaseClient.ts` — connexion à Supabase
- `supabase/schema.sql`, `supabase/migrations/` — schéma de la base + règles de sécurité
