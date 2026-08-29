import { Heart } from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";

export function FavoriteButton({
  songId,
  className,
  onDark,
}: {
  songId: string;
  className?: string;
  /** Utilisé sur une vignette (fond sombre fixe, quel que soit le thème du site) :
   * force des couleurs claires fixes au lieu des jetons de thème, qui deviendraient
   * illisibles en mode clair sur ce fond qui, lui, ne change jamais. */
  onDark?: boolean;
}) {
  const { t } = useTranslation("songs");
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  if (!isAuthenticated) return null;
  const active = isFavorite(songId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(songId);
      }}
      aria-label={active ? t("favoriteButton.removeAria") : t("favoriteButton.addAria")}
      aria-pressed={active}
      className={clsx(
        "flex items-center justify-center rounded-full transition-colors",
        onDark
          ? active
            ? "text-[#D4A94A]"
            : "text-[#F6E9DC]/70 hover:text-[#F6E9DC]"
          : active
            ? "text-accent-ink"
            : "text-muted hover:text-ink",
        className
      )}
    >
      <Heart size={18} fill={active ? "currentColor" : "none"} strokeWidth={1.8} />
    </button>
  );
}
