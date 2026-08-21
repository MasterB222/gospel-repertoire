import { useEffect, useState } from "react";
import { FileMusic } from "lucide-react";
import { SongCard } from "../components/catalog/SongCard";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { listSongs } from "../lib/catalog";
import type { Song } from "../types/catalog";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function Partitions() {
  useDocumentTitle("Partitions");
  const [songs, setSongs] = useState<Song[] | null>(null);

  useEffect(() => {
    listSongs().then((all) => setSongs(all.filter((s) => s.partition_url)));
  }, []);

  return (
    <div>
      <h1 className="mb-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">Partitions</h1>
      <p className="mb-6 text-sm text-muted">Chansons du répertoire disposant d'une partition.</p>

      {songs === null ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full" />
          ))}
        </div>
      ) : songs.length === 0 ? (
        <EmptyState
          icon={FileMusic}
          title="Aucune partition disponible"
          description="Les chansons avec une partition renseignée apparaîtront ici."
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
