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
  CalendarDays,
  User,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const MAIN_LINKS: NavItem[] = [
  { to: "/", label: "Accueil", icon: Home, end: true },
  { to: "/songs", label: "Répertoire", icon: BookOpen },
  { to: "/explore", label: "Explorer", icon: Compass },
  { to: "/categories", label: "Catégories", icon: LayoutGrid },
  { to: "/artists", label: "Artistes", icon: Mic2 },
  { to: "/playlists", label: "Playlists", icon: ListMusic },
  { to: "/favorites", label: "Favoris", icon: Star },
  { to: "/partitions", label: "Partitions", icon: FileMusic },
  { to: "/calendar", label: "Calendrier", icon: CalendarDays },
  { to: "/library", label: "Ma bibliothèque", icon: Library },
  { to: "/history", label: "Historique", icon: History },
];

export const SPACE_LINKS: NavItem[] = [
  { to: "/profile", label: "Profil", icon: User },
  { to: "/playlists", label: "Mes playlists", icon: ListMusic },
  { to: "/library", label: "Mes chansons", icon: BookOpen },
  { to: "/settings", label: "Paramètres", icon: Settings },
];

export function linkClasses(isActive: boolean) {
  return clsx(
    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
    isActive
      ? "bg-accent/15 font-semibold text-accent-ink"
      : "text-muted hover:bg-surface-raised hover:text-ink"
  );
}
