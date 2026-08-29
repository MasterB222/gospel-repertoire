import { useState } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Home, BookOpen, Star, User, Menu as MenuIcon, type LucideIcon } from "lucide-react";
import { MobileMenu } from "./MobileMenu";

const LINKS: { to: string; labelKey: string; icon: LucideIcon; end?: boolean }[] = [
  { to: "/", labelKey: "nav.home", icon: Home, end: true },
  { to: "/songs", labelKey: "nav.songs", icon: BookOpen },
  { to: "/favorites", labelKey: "nav.favorites", icon: Star },
  { to: "/profile", labelKey: "nav.profile", icon: User },
];

export function MobileNavbar() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
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
            {t(link.labelKey)}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label={t("nav.openMenu")}
          className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-muted"
        >
          <MenuIcon size={20} strokeWidth={1.8} aria-hidden="true" />
          {t("nav.menu")}
        </button>
      </nav>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
