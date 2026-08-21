import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Home } from "./routes/Home";
import { Login } from "./routes/auth/Login";
import { Register } from "./routes/auth/Register";
import { ForgotPassword } from "./routes/auth/ForgotPassword";
import { Placeholder } from "./routes/Placeholder";
import { RequireAuth } from "./routes/RequireAuth";
import { SongsList } from "./routes/songs/SongsList";
import { SongDetail } from "./routes/songs/SongDetail";
import { ArtistsList } from "./routes/artists/ArtistsList";
import { ArtistDetail } from "./routes/artists/ArtistDetail";
import { CategoriesList } from "./routes/categories/CategoriesList";
import { CategoryDetail } from "./routes/categories/CategoryDetail";
import { SongEditor } from "./routes/songs/SongEditor";

const PHASE_2 = "Phase 2 — Répertoire de base";
const PHASE_4 = "Phase 4 — Collaboration & assignations";
const PHASE_6 = "Phase 6 — Compte utilisateur";
const PHASE_7 = "Phase 7 — Administration";

function placeholder(title: string, phase: string) {
  return <Placeholder title={title} phase={phase} />;
}

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  {
    path: "/songs/:id/edit",
    element: (
      <RequireAuth>
        <SongEditor />
      </RequireAuth>
    ),
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "search", element: placeholder("Recherche", PHASE_2) },
      { path: "explore", element: placeholder("Explorer", PHASE_2) },
      { path: "songs", element: <SongsList /> },
      { path: "songs/:id", element: <SongDetail /> },
      { path: "artists", element: <ArtistsList /> },
      { path: "artists/:id", element: <ArtistDetail /> },
      { path: "categories", element: <CategoriesList /> },
      { path: "categories/:id", element: <CategoryDetail /> },
      { path: "partitions", element: placeholder("Partitions", PHASE_2) },
      { path: "help", element: placeholder("Aide", PHASE_6) },
      {
        path: "dashboard",
        element: <RequireAuth>{placeholder("Dashboard chef de chœur", PHASE_4)}</RequireAuth>,
      },
      {
        path: "playlists",
        element: <RequireAuth>{placeholder("Playlists", PHASE_6)}</RequireAuth>,
      },
      {
        path: "playlists/:id",
        element: <RequireAuth>{placeholder("Détail playlist", PHASE_6)}</RequireAuth>,
      },
      {
        path: "favorites",
        element: <RequireAuth>{placeholder("Favoris", PHASE_6)}</RequireAuth>,
      },
      {
        path: "library",
        element: <RequireAuth>{placeholder("Ma bibliothèque", PHASE_6)}</RequireAuth>,
      },
      {
        path: "history",
        element: <RequireAuth>{placeholder("Historique", PHASE_6)}</RequireAuth>,
      },
      {
        path: "profile",
        element: <RequireAuth>{placeholder("Profil", PHASE_6)}</RequireAuth>,
      },
      {
        path: "settings",
        element: <RequireAuth>{placeholder("Paramètres", PHASE_6)}</RequireAuth>,
      },
      {
        path: "admin",
        element: <RequireAuth>{placeholder("Dashboard admin", PHASE_7)}</RequireAuth>,
      },
      {
        path: "admin/songs",
        element: <RequireAuth>{placeholder("Admin — Chansons", PHASE_7)}</RequireAuth>,
      },
      {
        path: "admin/songs/create",
        element: <RequireAuth>{placeholder("Admin — Créer une chanson", PHASE_7)}</RequireAuth>,
      },
      {
        path: "admin/songs/:id/edit",
        element: <RequireAuth>{placeholder("Admin — Modifier une chanson", PHASE_7)}</RequireAuth>,
      },
      {
        path: "admin/artists",
        element: <RequireAuth>{placeholder("Admin — Artistes", PHASE_7)}</RequireAuth>,
      },
      {
        path: "admin/categories",
        element: <RequireAuth>{placeholder("Admin — Catégories", PHASE_7)}</RequireAuth>,
      },
      {
        path: "admin/users",
        element: <RequireAuth>{placeholder("Admin — Utilisateurs", PHASE_7)}</RequireAuth>,
      },
      { path: "*", element: placeholder("Page introuvable", PHASE_2) },
    ],
  },
]);
