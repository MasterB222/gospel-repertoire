import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Music2, Mic2, LayoutGrid, Users, type LucideIcon } from "lucide-react";

const LINKS: { to: string; labelKey: string; icon: LucideIcon; end?: boolean }[] = [
  { to: "/admin", labelKey: "adminNav.dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/songs", labelKey: "adminNav.songs", icon: Music2 },
  { to: "/admin/artists", labelKey: "adminNav.artists", icon: Mic2 },
  { to: "/admin/categories", labelKey: "adminNav.categories", icon: LayoutGrid },
  { to: "/admin/users", labelKey: "adminNav.users", icon: Users },
];

export function AdminNav() {
  const { t } = useTranslation();

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
          {t(link.labelKey)}
        </NavLink>
      ))}
    </div>
  );
}
