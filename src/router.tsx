import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Home } from "./routes/Home";
import { Login } from "./routes/auth/Login";
import { Register } from "./routes/auth/Register";
import { ForgotPassword } from "./routes/auth/ForgotPassword";
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
import { RequireAdmin } from "./routes/RequireAdmin";
import { AdminDashboard } from "./routes/admin/AdminDashboard";
import { AdminSongsList } from "./routes/admin/AdminSongsList";
import { AdminSongEditor } from "./routes/admin/AdminSongEditor";
import { AdminArtists } from "./routes/admin/AdminArtists";
import { AdminCategories } from "./routes/admin/AdminCategories";
import { AdminUsers } from "./routes/admin/AdminUsers";
import { Explore } from "./routes/Explore";
import { Partitions } from "./routes/Partitions";
import { Help } from "./routes/Help";
import { NotFound } from "./routes/NotFound";

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
      { path: "search", element: <SongsList /> },
      { path: "explore", element: <Explore /> },
      { path: "songs", element: <SongsList /> },
      { path: "songs/:id", element: <SongDetail /> },
      { path: "artists", element: <ArtistsList /> },
      { path: "artists/:id", element: <ArtistDetail /> },
      { path: "categories", element: <CategoriesList /> },
      { path: "categories/:id", element: <CategoryDetail /> },
      { path: "partitions", element: <Partitions /> },
      { path: "help", element: <Help /> },
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
        element: (
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        ),
      },
      {
        path: "admin/songs",
        element: (
          <RequireAdmin>
            <AdminSongsList />
          </RequireAdmin>
        ),
      },
      {
        path: "admin/songs/create",
        element: (
          <RequireAdmin>
            <AdminSongEditor />
          </RequireAdmin>
        ),
      },
      {
        path: "admin/songs/:id/edit",
        element: (
          <RequireAdmin>
            <AdminSongEditor />
          </RequireAdmin>
        ),
      },
      {
        path: "admin/artists",
        element: (
          <RequireAdmin>
            <AdminArtists />
          </RequireAdmin>
        ),
      },
      {
        path: "admin/categories",
        element: (
          <RequireAdmin>
            <AdminCategories />
          </RequireAdmin>
        ),
      },
      {
        path: "admin/users",
        element: (
          <RequireAdmin>
            <AdminUsers />
          </RequireAdmin>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
