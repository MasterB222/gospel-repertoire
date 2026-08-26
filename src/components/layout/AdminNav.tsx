import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { LayoutDashboard, Music2, Mic2, LayoutGrid, Users, type LucideIcon } from "lucide-react";

const LINKS: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/songs", label: "Chansons", icon: Music2 },
  { to: "/admin/artists", label: "Artistes", icon: Mic2 },
  { to: "/admin/categories", label: "Catégories", icon: LayoutGrid },
  { to: "/admin/users", label: "Utilisateurs", icon: Users },
];

export function AdminNav() {
  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border pb-px">
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            clsx(
              "flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors",
              isActive ? "border-accent font-semibold text-accent-ink" : "border-transparent text-muted hover:text-ink"
            )
          }
        >
          <link.icon size={15} strokeWidth={1.8} />
          {link.label}
        </NavLink>
      ))}
    </div>
  );
}
