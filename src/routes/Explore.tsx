import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { ArtistCard } from "../components/catalog/ArtistCard";
import { CategoryCard } from "../components/catalog/CategoryCard";
import { SongCard } from "../components/catalog/SongCard";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { listArtists, listCategories, listSongs } from "../lib/catalog";
import type { Artist, Category, Song } from "../types/catalog";

export function Explore() {
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
    return <EmptyState icon={Compass} title="Rien à explorer pour l'instant" description="Le répertoire est encore vide." />;
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">Explorer</h1>
        <p className="mt-1 text-sm text-muted">Découvre le répertoire par nouveautés, artistes et catégories.</p>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-ink">Nouveautés</h2>
          <Link to="/songs" className="text-xs text-accent hover:underline">
            Tout le répertoire
          </Link>
        </div>
        {songs.length === 0 ? (
          <p className="text-sm text-muted">Aucune chanson pour l'instant.</p>
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
          <h2 className="font-serif text-lg font-semibold text-ink">Artistes</h2>
          <Link to="/artists" className="text-xs text-accent hover:underline">
            Tous les artistes
          </Link>
        </div>
        {artists.length === 0 ? (
          <p className="text-sm text-muted">Aucun artiste pour l'instant.</p>
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
          <h2 className="font-serif text-lg font-semibold text-ink">Catégories</h2>
          <Link to="/categories" className="text-xs text-accent hover:underline">
            Toutes les catégories
          </Link>
        </div>
        {categories.length === 0 ? (
          <p className="text-sm text-muted">Aucune catégorie pour l'instant.</p>
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
