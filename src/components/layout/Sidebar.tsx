import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Sun, Moon, HelpCircle, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabaseClient";
import { Logo } from "../brand/Logo";
import { MAIN_LINKS, SPACE_LINKS, linkClasses } from "./navLinks";
import { LanguageToggle } from "./LanguageToggle";

export function Sidebar() {
  const { t } = useTranslation();
  const { isAuthenticated, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <Logo className="h-8 w-8" />
        <span className="font-serif text-lg font-semibold tracking-tight text-ink">{t("app.name")}</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {MAIN_LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => linkClasses(isActive)}>
            <link.icon size={18} strokeWidth={1.8} aria-hidden="true" />
            {t(link.labelKey)}
          </NavLink>
        ))}

        {isAuthenticated && (
          <div className="mt-6">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t("nav.mySpace")}</p>
            {SPACE_LINKS.map((link) => (
              <NavLink key={link.labelKey} to={link.to} className={({ isActive }) => linkClasses(isActive)}>
                <link.icon size={18} strokeWidth={1.8} aria-hidden="true" />
                {t(link.labelKey)}
              </NavLink>
            ))}
          </div>
        )}

        {profile?.role === "admin" && (
          <div className="mt-6">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t("nav.admin")}</p>
            <NavLink to="/admin" end className={({ isActive }) => linkClasses(isActive)}>
              <ShieldCheck size={18} strokeWidth={1.8} aria-hidden="true" />
              {t("nav.adminDashboard")}
            </NavLink>
          </div>
        )}
      </nav>

      <div className="space-y-1 border-t border-border px-3 py-4">
        <button onClick={toggleTheme} className={clsx(linkClasses(false), "w-full")}>
          <ThemeIcon size={18} strokeWidth={1.8} aria-hidden="true" />
          {theme === "dark" ? t("nav.lightTheme") : t("nav.darkTheme")}
        </button>
        <LanguageToggle />
        <NavLink to="/help" className={({ isActive }) => linkClasses(isActive)}>
          <HelpCircle size={18} strokeWidth={1.8} aria-hidden="true" />
          {t("nav.help")}
        </NavLink>
        {isAuthenticated && (
          <button onClick={() => supabase.auth.signOut()} className={clsx(linkClasses(false), "w-full")}>
            <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
            {t("nav.logout")}
          </button>
        )}
      </div>
    </aside>
  );
}
