import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Home } from "./routes/Home";
import { Login } from "./routes/auth/Login";
import { Register } from "./routes/auth/Register";
import { ForgotPassword } from "./routes/auth/ForgotPassword";
import { ResetPassword } from "./routes/auth/ResetPassword";
import { RequireAuth } from "./routes/RequireAuth";
import { RequireAdmin } from "./routes/RequireAdmin";
import { SongsList } from "./routes/songs/SongsList";
import { SongDetail } from "./routes/songs/SongDetail";
import { ArtistsList } from "./routes/artists/ArtistsList";
import { ArtistDetail } from "./routes/artists/ArtistDetail";
import { CategoriesList } from "./routes/categories/CategoriesList";
import { CategoryDetail } from "./routes/categories/CategoryDetail";
import { Dashboard } from "./routes/Dashboard";
import { Favorites } from "./routes/Favorites";
import { Library } from "./routes/Library";
import { HistoryPage } from "./routes/History";
import { Profile } from "./routes/Profile";
import { Settings } from "./routes/Settings";
import { PlaylistsList } from "./routes/playlists/PlaylistsList";
import { PlaylistDetail } from "./routes/playlists/PlaylistDetail";
import { Explore } from "./routes/Explore";
import { Partitions } from "./routes/Partitions";
import { Help } from "./routes/Help";
import { NotFound } from "./routes/NotFound";
import { Skeleton } from "./components/ui/Skeleton";

// Écrans plus lourds ou moins fréquemment visités : chargés à la demande
// pour réduire le bundle initial (éditeur, modes plein écran, administration).
const SongEditor = lazy(() => import("./routes/songs/SongEditor").then((m) => ({ default: m.SongEditor })));
const RehearseMode = lazy(() => import("./routes/songs/RehearseMode").then((m) => ({ default: m.RehearseMode })));
const PresentMode = lazy(() => import("./routes/songs/PresentMode").then((m) => ({ default: m.PresentMode })));
const LearnMode = lazy(() => import("./routes/songs/LearnMode").then((m) => ({ default: m.LearnMode })));
const AdminDashboard = lazy(() => import("./routes/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const AdminSongsList = lazy(() => import("./routes/admin/AdminSongsList").then((m) => ({ default: m.AdminSongsList })));
const AdminSongEditor = lazy(() => import("./routes/admin/AdminSongEditor").then((m) => ({ default: m.AdminSongEditor })));
const AdminArtists = lazy(() => import("./routes/admin/AdminArtists").then((m) => ({ default: m.AdminArtists })));
const AdminCategories = lazy(() => import("./routes/admin/AdminCategories").then((m) => ({ default: m.AdminCategories })));
const AdminUsers = lazy(() => import("./routes/admin/AdminUsers").then((m) => ({ default: m.AdminUsers })));
const AdminLayout = lazy(() => import("./routes/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const CalendarPage = lazy(() => import("./routes/events/Calendar").then((m) => ({ default: m.CalendarPage })));
const EventDetail = lazy(() => import("./routes/events/EventDetail").then((m) => ({ default: m.EventDetail })));

function RouteFallback() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

function lazyPage(node: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{node}</Suspense>;
}

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  {
    path: "/songs/:id/edit",
    element: <RequireAuth>{lazyPage(<SongEditor />)}</RequireAuth>,
  },
  {
    path: "/songs/:id/rehearse",
    element: <RequireAuth>{lazyPage(<RehearseMode />)}</RequireAuth>,
  },
  {
    path: "/songs/:id/present",
    element: <RequireAuth>{lazyPage(<PresentMode />)}</RequireAuth>,
  },
  {
    path: "/songs/:id/learn",
    element: <RequireAuth>{lazyPage(<LearnMode />)}</RequireAuth>,
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
      { path: "calendar", element: lazyPage(<CalendarPage />) },
      { path: "events/:id", element: lazyPage(<EventDetail />) },
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
        element: <RequireAdmin>{lazyPage(<AdminLayout />)}</RequireAdmin>,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "songs", element: <AdminSongsList /> },
          { path: "songs/create", element: <AdminSongEditor /> },
          { path: "songs/:id/edit", element: <AdminSongEditor /> },
          { path: "artists", element: <AdminArtists /> },
          { path: "categories", element: <AdminCategories /> },
          { path: "users", element: <AdminUsers /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
