import { Heart } from "lucide-react";
import clsx from "clsx";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";

export function FavoriteButton({ songId, className }: { songId: string; className?: string }) {
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
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={active}
      className={clsx(
        "flex items-center justify-center rounded-full transition-colors",
        active ? "text-accent" : "text-muted hover:text-ink",
        className
      )}
    >
      <Heart size={18} fill={active ? "currentColor" : "none"} strokeWidth={1.8} />
    </button>
  );
}
