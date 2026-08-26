import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { Home, Search, BookOpen, Star, User, type LucideIcon } from "lucide-react";

const LINKS: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: "/", label: "Accueil", icon: Home, end: true },
  { to: "/search", label: "Recherche", icon: Search },
  { to: "/songs", label: "Répertoire", icon: BookOpen },
  { to: "/favorites", label: "Favoris", icon: Star },
  { to: "/profile", label: "Profil", icon: User },
];

export function MobileNavbar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur-glass md:hidden">
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            clsx(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px]",
              isActive ? "text-accent-ink" : "text-muted"
            )
          }
        >
          <link.icon size={20} strokeWidth={1.8} aria-hidden="true" />
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
