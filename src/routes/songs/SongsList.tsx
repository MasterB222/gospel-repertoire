import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, RotateCcw } from "lucide-react";
import { SongCard } from "../../components/catalog/SongCard";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { listSongs } from "../../lib/catalog";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { Song } from "../../types/catalog";

type SortKey = "recent" | "az" | "artist";

const PAGE_SIZE = 24;

const EMPTY_FILTERS = {
  artist: "",
  category: "",
  language: "",
  key: "",
  difficulty: "",
  year: "",
  chords: "",
  video: "",
};

const selectClasses =
  "rounded-xl border border-border bg-surface-raised px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function SongsList() {
  useDocumentTitle("Répertoire");
  const [searchParams] = useSearchParams();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState<SortKey>("recent");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      setSongs(await listSongs());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setQuery(q);
  }, [searchParams]);

  const options = useMemo(() => {
    const uniq = (values: (string | null | undefined)[]) =>
      Array.from(new Set(values.filter((v): v is string => !!v))).sort();
    return {
      artists: uniq(songs.map((s) => s.artist?.name)),
      categories: uniq(songs.map((s) => s.category?.name)),
      languages: uniq(songs.map((s) => s.language)),
      keys: uniq(songs.map((s) => s.original_key)),
      years: uniq(songs.map((s) => s.year?.toString())),
    };
  }, [songs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = songs.filter((s) => {
      if (q) {
        const haystack = [s.title, s.lyrics, s.artist?.name, s.category?.name, s.language, s.original_key]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.artist && s.artist?.name !== filters.artist) return false;
      if (filters.category && s.category?.name !== filters.category) return false;
      if (filters.language && s.language !== filters.language) return false;
      if (filters.key && s.original_key !== filters.key) return false;
      if (filters.difficulty && s.difficulty !== filters.difficulty) return false;
      if (filters.year && s.year?.toString() !== filters.year) return false;
      if (filters.chords === "avec" && !s.chords.trim()) return false;
      if (filters.chords === "sans" && s.chords.trim()) return false;
      if (filters.video === "avec" && !s.youtube_url.trim()) return false;
      if (filters.video === "sans" && s.youtube_url.trim()) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "az") return a.title.localeCompare(b.title);
      if (sortBy === "artist") return (a.artist?.name ?? "").localeCompare(b.artist?.name ?? "");
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [songs, query, filters, sortBy]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, filters, sortBy]);

  const visible = filtered.slice(0, visibleCount);
  const hasActiveFilters = query || Object.values(filters).some(Boolean);

  function resetFilters() {
    setQuery("");
    setFilters(EMPTY_FILTERS);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">Répertoire</h1>
          <p className="mt-1 text-sm text-muted">{filtered.length} chanson(s)</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3">
        <div className="relative max-w-lg">
          <Search size={16} strokeWidth={1.8} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par titre, artiste, paroles..."
            className="w-full rounded-xl border border-border bg-surface-raised py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filters.artist}
            onChange={(e) => setFilters((f) => ({ ...f, artist: e.target.value }))}
            className={selectClasses}
          >
            <option value="">Tous les artistes</option>
            {options.artists.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            className={selectClasses}
          >
            <option value="">Toutes les catégories</option>
            {options.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={filters.language}
            onChange={(e) => setFilters((f) => ({ ...f, language: e.target.value }))}
            className={selectClasses}
          >
            <option value="">Toutes les langues</option>
            {options.languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <select
            value={filters.key}
            onChange={(e) => setFilters((f) => ({ ...f, key: e.target.value }))}
            className={selectClasses}
          >
            <option value="">Toutes les tonalités</option>
            {options.keys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters((f) => ({ ...f, difficulty: e.target.value }))}
            className={selectClasses}
          >
            <option value="">Toute difficulté</option>
            <option value="Facile">Facile</option>
            <option value="Intermédiaire">Intermédiaire</option>
            <option value="Avancé">Avancé</option>
          </select>
          <select
            value={filters.year}
            onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
            className={selectClasses}
          >
            <option value="">Toute année</option>
            {options.years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={filters.chords}
            onChange={(e) => setFilters((f) => ({ ...f, chords: e.target.value }))}
            className={selectClasses}
          >
            <option value="">Accords : indifférent</option>
            <option value="avec">Avec accords</option>
            <option value="sans">Sans accords</option>
          </select>
          <select
            value={filters.video}
            onChange={(e) => setFilters((f) => ({ ...f, video: e.target.value }))}
            className={selectClasses}
          >
            <option value="">Vidéo : indifférent</option>
            <option value="avec">Avec vidéo</option>
            <option value="sans">Sans vidéo</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className={selectClasses}
          >
            <option value="recent">Trier : récent</option>
            <option value="az">Trier : A-Z</option>
            <option value="artist">Trier : artiste</option>
          </select>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={resetFilters} className="!px-3">
              <RotateCcw size={15} strokeWidth={1.8} />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full" />
          ))}
        </div>
      )}

      {!loading && error && (
        <EmptyState
          icon={Search}
          title="Impossible de charger le répertoire"
          description="Une erreur est survenue en contactant la base de données."
          action={<Button onClick={load}>Réessayer</Button>}
        />
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={Search}
          title="Aucune chanson trouvée"
          description="Essaie une autre recherche ou réinitialise les filtres."
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            ) : undefined
          }
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visible.map((song) => (
              <SongCard key={song.id} song={song} queue={filtered} />
            ))}
          </div>
          {visibleCount < filtered.length && (
            <div className="mt-6 flex justify-center">
              <Button variant="secondary" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                Charger plus ({filtered.length - visibleCount} restantes)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
