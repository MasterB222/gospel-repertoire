import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { listFavoriteIds, setFavorite } from "../lib/library";

interface FavoritesContextValue {
  favoriteIds: Set<string>;
  isFavorite: (songId: string) => boolean;
  toggleFavorite: (songId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!profile) {
      setFavoriteIds(new Set());
      return;
    }
    listFavoriteIds(profile.id).then(setFavoriteIds);
  }, [profile]);

  async function toggleFavorite(songId: string) {
    if (!profile) return;
    const isFav = favoriteIds.has(songId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(songId);
      else next.add(songId);
      return next;
    });
    try {
      await setFavorite(profile.id, songId, !isFav);
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(songId);
        else next.delete(songId);
        return next;
      });
    }
  }

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite: (id) => favoriteIds.has(id), toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
}
