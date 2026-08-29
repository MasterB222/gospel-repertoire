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
  labelKey: string;
  icon: LucideIcon;
  end?: boolean;
}

export const MAIN_LINKS: NavItem[] = [
  { to: "/", labelKey: "nav.home", icon: Home, end: true },
  { to: "/songs", labelKey: "nav.songs", icon: BookOpen },
  { to: "/explore", labelKey: "nav.explore", icon: Compass },
  { to: "/categories", labelKey: "nav.categories", icon: LayoutGrid },
  { to: "/artists", labelKey: "nav.artists", icon: Mic2 },
  { to: "/playlists", labelKey: "nav.playlists", icon: ListMusic },
  { to: "/favorites", labelKey: "nav.favorites", icon: Star },
  { to: "/partitions", labelKey: "nav.partitions", icon: FileMusic },
  { to: "/calendar", labelKey: "nav.calendar", icon: CalendarDays },
  { to: "/library", labelKey: "nav.library", icon: Library },
  { to: "/history", labelKey: "nav.history", icon: History },
];

export const SPACE_LINKS: NavItem[] = [
  { to: "/profile", labelKey: "nav.profile", icon: User },
  { to: "/playlists", labelKey: "nav.myPlaylists", icon: ListMusic },
  { to: "/library", labelKey: "nav.mySongs", icon: BookOpen },
  { to: "/settings", labelKey: "nav.settings", icon: Settings },
];

export function linkClasses(isActive: boolean) {
  return clsx(
    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
    isActive
      ? "bg-accent/15 font-semibold text-accent-ink"
      : "text-muted hover:bg-surface-raised hover:text-ink"
  );
}
