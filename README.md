# Répertoire Gospel

App de gestion du répertoire (paroles, accords, notes) : lecture publique pour tout le groupe, édition réservée à l'admin.

## Étapes de mise en route

### 1. Supabase (base de données)

1. Crée un compte sur https://supabase.com (gratuit, connexion possible via GitHub).
2. Crée un nouveau projet (choisis une région proche, note le mot de passe DB généré).
3. Une fois le projet prêt : onglet **SQL Editor** > New query > colle le contenu de [`supabase/schema.sql`](supabase/schema.sql) > **Run**. Ça crée la table `songs` et les règles de sécurité (lecture publique, écriture réservée aux connectés).
4. Onglet **Authentication > Users** > **Add user** : crée ton compte admin (email + mot de passe). C'est le seul compte qui pourra ajouter/modifier/supprimer des chansons.
5. Onglet **Project Settings > API** : récupère `Project URL` et la clé `anon public`.

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

Ouvre l'URL affichée (http://localhost:5173). Clique sur **Connexion admin** en haut à droite pour te connecter avec le compte créé à l'étape 1.4 et commencer à ajouter des chansons.

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

- `src/main.js` — logique de l'app (rendu, CRUD, auth)
- `src/supabaseClient.js` — connexion à Supabase
- `supabase/schema.sql` — schéma de la base + règles de sécurité
