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
import { RehearseMode } from "./routes/songs/RehearseMode";
import { PresentMode } from "./routes/songs/PresentMode";
import { LearnMode } from "./routes/songs/LearnMode";
import { Dashboard } from "./routes/Dashboard";
import { Favorites } from "./routes/Favorites";
import { Library } from "./routes/Library";
import { HistoryPage } from "./routes/History";
import { Profile } from "./routes/Profile";
import { Settings } from "./routes/Settings";
import { PlaylistsList } from "./routes/playlists/PlaylistsList";
import { PlaylistDetail } from "./routes/playlists/PlaylistDetail";

const PHASE_2 = "Phase 2 — Répertoire de base";
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
    path: "/songs/:id/rehearse",
    element: (
      <RequireAuth>
        <RehearseMode />
      </RequireAuth>
    ),
  },
  {
    path: "/songs/:id/present",
    element: (
      <RequireAuth>
        <PresentMode />
      </RequireAuth>
    ),
  },
  {
    path: "/songs/:id/learn",
    element: (
      <RequireAuth>
        <LearnMode />
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
        element: (
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        ),
      },
      {
        path: "playlists",
        element: (
          <RequireAuth>
            <PlaylistsList />
          </RequireAuth>
        ),
      },
      {
        path: "playlists/:id",
        element: (
          <RequireAuth>
            <PlaylistDetail />
          </RequireAuth>
        ),
      },
      {
        path: "favorites",
        element: (
          <RequireAuth>
            <Favorites />
          </RequireAuth>
        ),
      },
      {
        path: "library",
        element: (
          <RequireAuth>
            <Library />
          </RequireAuth>
        ),
      },
      {
        path: "history",
        element: (
          <RequireAuth>
            <HistoryPage />
          </RequireAuth>
        ),
      },
      {
        path: "profile",
        element: (
          <RequireAuth>
            <Profile />
          </RequireAuth>
        ),
      },
      {
        path: "settings",
        element: (
          <RequireAuth>
            <Settings />
          </RequireAuth>
        ),
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
