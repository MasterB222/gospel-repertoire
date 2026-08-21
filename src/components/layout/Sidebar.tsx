import { NavLink } from "react-router-dom";
import clsx from "clsx";
import {
  Home,
  BookOpen,
  Compass,
  LayoutGrid,
  Mic2,
  ListMusic,
  Star,
  FileMusic,
  Library,
  History,
  User,
  Settings,
  Sun,
  Moon,
  HelpCircle,
  LogOut,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabaseClient";
import { Logo } from "../brand/Logo";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const MAIN_LINKS: NavItem[] = [
  { to: "/", label: "Accueil", icon: Home, end: true },
  { to: "/songs", label: "Répertoire", icon: BookOpen },
  { to: "/explore", label: "Explorer", icon: Compass },
  { to: "/categories", label: "Catégories", icon: LayoutGrid },
  { to: "/artists", label: "Artistes", icon: Mic2 },
  { to: "/playlists", label: "Playlists", icon: ListMusic },
  { to: "/favorites", label: "Favoris", icon: Star },
  { to: "/partitions", label: "Partitions", icon: FileMusic },
  { to: "/library", label: "Ma bibliothèque", icon: Library },
  { to: "/history", label: "Historique", icon: History },
];

const SPACE_LINKS: NavItem[] = [
  { to: "/profile", label: "Profil", icon: User },
  { to: "/playlists", label: "Mes playlists", icon: ListMusic },
  { to: "/library", label: "Mes chansons", icon: BookOpen },
  { to: "/settings", label: "Paramètres", icon: Settings },
];

function linkClasses(isActive: boolean) {
  return clsx(
    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
    isActive
      ? "bg-accent/15 font-semibold text-accent"
      : "text-muted hover:bg-surface-raised hover:text-ink"
  );
}

export function Sidebar() {
  const { isAuthenticated, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <Logo className="h-8 w-8" />
        <span className="font-serif text-lg font-semibold tracking-tight text-ink">Gospel Répertoire</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {MAIN_LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => linkClasses(isActive)}>
            <link.icon size={18} strokeWidth={1.8} aria-hidden="true" />
            {link.label}
          </NavLink>
        ))}

        {isAuthenticated && (
          <div className="mt-6">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">Mon espace</p>
            {SPACE_LINKS.map((link) => (
              <NavLink key={link.label} to={link.to} className={({ isActive }) => linkClasses(isActive)}>
                <link.icon size={18} strokeWidth={1.8} aria-hidden="true" />
                {link.label}
              </NavLink>
            ))}
          </div>
        )}

        {profile?.role === "admin" && (
          <div className="mt-6">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">Administration</p>
            <NavLink to="/admin" end className={({ isActive }) => linkClasses(isActive)}>
              <ShieldCheck size={18} strokeWidth={1.8} aria-hidden="true" />
              Dashboard admin
            </NavLink>
          </div>
        )}
      </nav>

      <div className="space-y-1 border-t border-border px-3 py-4">
        <button onClick={toggleTheme} className={clsx(linkClasses(false), "w-full")}>
          <ThemeIcon size={18} strokeWidth={1.8} aria-hidden="true" />
          {theme === "dark" ? "Thème clair" : "Thème sombre"}
        </button>
        <NavLink to="/help" className={({ isActive }) => linkClasses(isActive)}>
          <HelpCircle size={18} strokeWidth={1.8} aria-hidden="true" />
          Aide
        </NavLink>
        {isAuthenticated && (
          <button onClick={() => supabase.auth.signOut()} className={clsx(linkClasses(false), "w-full")}>
            <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
            Déconnexion
          </button>
        )}
      </div>
    </aside>
  );
}
