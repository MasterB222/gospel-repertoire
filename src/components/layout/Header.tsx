import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../ui/Button";

export function Header() {
  const { t } = useTranslation();
  const { isAuthenticated, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/songs?q=${encodeURIComponent(q)}` : "/songs");
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur-glass sm:px-6">
      <form onSubmit={handleSearch} className="relative flex-1">
        <Search
          size={16}
          strokeWidth={1.8}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          className="w-full max-w-md rounded-lg border border-border bg-surface-raised py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
      </form>

      <button
        onClick={toggleTheme}
        aria-label={t("nav.toggleTheme")}
        className="rounded-lg p-2 text-muted hover:bg-surface-raised hover:text-ink md:hidden"
      >
        <ThemeIcon size={18} strokeWidth={1.8} />
      </button>

      {isAuthenticated ? (
        <Link
          to="/profile"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink hover:bg-surface-raised"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-sm font-bold text-[#2A0F1E]">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              profile?.first_name?.[0]?.toUpperCase() ?? "?"
            )}
          </span>
          <span className="hidden sm:inline">{profile?.first_name ?? t("nav.account")}</span>
        </Link>
      ) : (
        <Button variant="secondary" onClick={() => navigate("/login")}>
          {t("nav.login")}
        </Button>
      )}
    </header>
  );
}
