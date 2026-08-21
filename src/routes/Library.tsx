import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ListMusic, Clock, FileMusic } from "lucide-react";
import { SongCard } from "../components/catalog/SongCard";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuth } from "../context/AuthContext";
import { listFavoriteSongs, listHistory, listPlaylists } from "../lib/library";
import type { Song } from "../types/catalog";
import type { HistoryEntry } from "../types/library";
import type { Playlist } from "../types/library";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function Library() {
  useDocumentTitle("Ma bibliothèque");
  const { profile } = useAuth();
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    Promise.all([listFavoriteSongs(profile.id), listPlaylists(profile.id), listHistory(profile.id, 5)]).then(
      ([f, p, h]) => {
        setFavorites(f);
        setPlaylists(p);
        setHistory(h);
        setLoading(false);
      }
    );
  }, [profile]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">Ma bibliothèque</h1>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 font-serif text-lg font-semibold text-ink">
            <Heart size={18} />
            Favoris
          </h2>
          <Link to="/favorites" className="text-xs text-accent hover:underline">
            Tout voir
          </Link>
        </div>
        {favorites.length === 0 ? (
          <p className="text-sm text-muted">Aucun favori pour l'instant.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {favorites.slice(0, 4).map((song) => (
              <SongCard key={song.id} song={song} queue={favorites} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 font-serif text-lg font-semibold text-ink">
            <ListMusic size={18} />
            Playlists
          </h2>
          <Link to="/playlists" className="text-xs text-accent hover:underline">
            Tout voir
          </Link>
        </div>
        {playlists.length === 0 ? (
          <p className="text-sm text-muted">Aucune playlist pour l'instant.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.map((p) => (
              <Link key={p.id} to={`/playlists/${p.id}`}>
                <Card className="p-4 hover:border-accent/40">
                  <p className="truncate font-semibold text-ink">{p.name}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 font-serif text-lg font-semibold text-ink">
            <Clock size={18} />
            Récemment consultés
          </h2>
          <Link to="/history" className="text-xs text-accent hover:underline">
            Tout voir
          </Link>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-muted">Aucune consultation récente.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {history.map((h) => (
              <SongCard key={h.song_id} song={h.song} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-1.5 font-serif text-lg font-semibold text-ink">
          <FileMusic size={18} />
          Mes partitions
        </h2>
        <p className="text-sm text-muted">
          Pas encore disponible — arrivera avec la gestion des partitions (module multimédia).
        </p>
      </section>
    </div>
  );
}
