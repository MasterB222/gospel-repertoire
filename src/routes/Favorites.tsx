import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { SongCard } from "../components/catalog/SongCard";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { useAuth } from "../context/AuthContext";
import { listFavoriteSongs } from "../lib/library";
import type { Song } from "../types/catalog";

export function Favorites() {
  const { profile } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    listFavoriteSongs(profile.id)
      .then(setSongs)
      .finally(() => setLoading(false));
  }, [profile]);

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-ink sm:text-3xl">Favoris</h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full" />
          ))}
        </div>
      ) : songs.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Aucun favori pour l'instant"
          description="Ajoute des chansons à tes favoris depuis le répertoire."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} queue={songs} />
          ))}
        </div>
      )}
    </div>
  );
}
