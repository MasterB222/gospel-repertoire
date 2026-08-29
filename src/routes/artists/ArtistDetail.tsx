import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Mic2 } from "lucide-react";
import { CoverPlaceholder } from "../../components/catalog/CoverPlaceholder";
import { SongCard } from "../../components/catalog/SongCard";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { getArtist, listSongsByArtist } from "../../lib/catalog";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { Artist, Song } from "../../types/catalog";

export function ArtistDetail() {
  const { t } = useTranslation("songs");
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null | undefined>(undefined);
  const [songs, setSongs] = useState<Song[]>([]);
  useDocumentTitle(artist?.name);

  useEffect(() => {
    if (!id) return;
    setArtist(undefined);
    Promise.all([getArtist(id), listSongsByArtist(id)])
      .then(([a, s]) => {
        setArtist(a);
        setSongs(s);
      })
      .catch(() => setArtist(null));
  }, [id]);

  if (artist === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-8 w-1/3" />
      </div>
    );
  }

  if (artist === null) {
    return (
      <EmptyState
        icon={Mic2}
        title={t("artists.notFoundTitle")}
        action={
          <Link to="/artists" className="text-sm font-semibold text-accent-ink hover:underline">
            {t("artists.backToArtists")}
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <Link to="/artists" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} strokeWidth={1.8} />
        {t("artists.backToArtists")}
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border border-border">
          <CoverPlaceholder icon={Mic2} imageUrl={artist.image_url || undefined} alt={artist.name} />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ink">{artist.name}</h1>
          {artist.biography && <p className="mt-2 max-w-xl text-sm text-muted">{artist.biography}</p>}
        </div>
      </div>

      <h2 className="mb-4 mt-10 font-serif text-lg font-semibold text-ink">
        {t("artists.songCount", { count: songs.length })}
      </h2>

      {songs.length === 0 ? (
        <EmptyState icon={Mic2} title={t("artists.noSongsForArtist")} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </div>
  );
}
