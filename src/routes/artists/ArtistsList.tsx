import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Mic2 } from "lucide-react";
import { ArtistCard } from "../../components/catalog/ArtistCard";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { listArtists, listSongs } from "../../lib/catalog";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { Artist, Song } from "../../types/catalog";

export function ArtistsList() {
  const { t } = useTranslation("songs");
  useDocumentTitle(t("artists.listTitle"));
  const [artists, setArtists] = useState<Artist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const [a, s] = await Promise.all([listArtists(), listSongs()]);
      setArtists(a);
      setSongs(s);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const countFor = (artistId: string) => songs.filter((s) => s.artist_id === artistId).length;

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-ink sm:text-3xl">{t("artists.listTitle")}</h1>

      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full" />
          ))}
        </div>
      )}

      {!loading && error && (
        <EmptyState
          icon={Mic2}
          title={t("artists.loadError.title")}
          description={t("artists.loadError.description")}
          action={<Button onClick={load}>{t("artists.loadError.retry")}</Button>}
        />
      )}

      {!loading && !error && artists.length === 0 && (
        <EmptyState icon={Mic2} title={t("artists.empty")} />
      )}

      {!loading && !error && artists.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} songCount={countFor(artist.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
