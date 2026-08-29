import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Compass } from "lucide-react";
import { ArtistCard } from "../components/catalog/ArtistCard";
import { CategoryCard } from "../components/catalog/CategoryCard";
import { SongCard } from "../components/catalog/SongCard";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { listArtists, listCategories, listSongs } from "../lib/catalog";
import type { Artist, Category, Song } from "../types/catalog";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function Explore() {
  const { t } = useTranslation("pages");
  useDocumentTitle(t("explore.title"));
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listSongs(), listArtists(), listCategories()]).then(([s, a, c]) => {
      setSongs(s);
      setArtists(a);
      setCategories(c);
      setLoading(false);
    });
  }, []);

  const countFor = (id: string, key: "artist_id" | "category_id") => songs.filter((s) => s[key] === id).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (songs.length === 0 && artists.length === 0 && categories.length === 0) {
    return <EmptyState icon={Compass} title={t("explore.emptyTitle")} description={t("explore.emptyDescription")} />;
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{t("explore.title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("explore.subtitle")}</p>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-ink">{t("explore.newSongs")}</h2>
          <Link to="/songs" className="text-xs text-accent-ink hover:underline">
            {t("explore.viewAllSongs")}
          </Link>
        </div>
        {songs.length === 0 ? (
          <p className="text-sm text-muted">{t("explore.noSongsYet")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {songs.slice(0, 5).map((song) => (
              <SongCard key={song.id} song={song} queue={songs} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-ink">{t("explore.artists")}</h2>
          <Link to="/artists" className="text-xs text-accent-ink hover:underline">
            {t("explore.viewAllArtists")}
          </Link>
        </div>
        {artists.length === 0 ? (
          <p className="text-sm text-muted">{t("explore.noArtistsYet")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {artists.slice(0, 5).map((artist) => (
              <ArtistCard key={artist.id} artist={artist} songCount={countFor(artist.id, "artist_id")} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-ink">{t("explore.categories")}</h2>
          <Link to="/categories" className="text-xs text-accent-ink hover:underline">
            {t("explore.viewAllCategories")}
          </Link>
        </div>
        {categories.length === 0 ? (
          <p className="text-sm text-muted">{t("explore.noCategoriesYet")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.slice(0, 5).map((category) => (
              <CategoryCard key={category.id} category={category} songCount={countFor(category.id, "category_id")} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
