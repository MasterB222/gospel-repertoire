import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { X, Sun, Moon, HelpCircle, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabaseClient";
import { MAIN_LINKS, SPACE_LINKS, linkClasses } from "./navLinks";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { isAuthenticated, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative ml-auto flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto bg-surface shadow-xl">
        <div className="flex items-center justify-between px-4 py-4">
          <span className="font-serif text-lg font-semibold text-ink">Menu</span>
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="rounded-lg p-1.5 text-muted hover:bg-surface-raised hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 pb-4">
          {MAIN_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) => linkClasses(isActive)}
            >
              <link.icon size={18} strokeWidth={1.8} aria-hidden="true" />
              {link.label}
            </NavLink>
          ))}

          {isAuthenticated && (
            <div className="mt-6">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">Mon espace</p>
              {SPACE_LINKS.map((link) => (
                <NavLink key={link.label} to={link.to} onClick={onClose} className={({ isActive }) => linkClasses(isActive)}>
                  <link.icon size={18} strokeWidth={1.8} aria-hidden="true" />
                  {link.label}
                </NavLink>
              ))}
            </div>
          )}

          {profile?.role === "admin" && (
            <div className="mt-6">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">Administration</p>
              <NavLink to="/admin" end onClick={onClose} className={({ isActive }) => linkClasses(isActive)}>
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
          <NavLink to="/help" onClick={onClose} className={({ isActive }) => linkClasses(isActive)}>
            <HelpCircle size={18} strokeWidth={1.8} aria-hidden="true" />
            Aide
          </NavLink>
          {isAuthenticated && (
            <button
              onClick={() => {
                onClose();
                supabase.auth.signOut();
              }}
              className={clsx(linkClasses(false), "w-full")}
            >
              <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
