import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

type Filters = typeof EMPTY_FILTERS;
type FilterKey = keyof Filters;

const DIFFICULTIES = ["Facile", "Intermédiaire", "Avancé"];

function songMatchesText(s: Song, q: string): boolean {
  if (!q) return true;
  const haystack = [s.title, s.lyrics, s.artist?.name, s.category?.name, s.language, s.original_key]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function songMatchesFilter(s: Song, key: FilterKey, value: string): boolean {
  if (!value) return true;
  switch (key) {
    case "artist":
      return s.artist?.name === value;
    case "category":
      return s.category?.name === value;
    case "language":
      return s.language === value;
    case "key":
      return s.original_key === value;
    case "difficulty":
      return s.difficulty === value;
    case "year":
      return s.year?.toString() === value;
    case "chords":
      return value === "avec" ? !!s.chords?.trim() : !s.chords?.trim();
    case "video":
      return value === "avec" ? !!s.youtube_url?.trim() : !s.youtube_url?.trim();
  }
}

// exclude ignore la dimension en cours d'édition, pour que ses propres options
// restent calculées à partir des AUTRES filtres actifs (facettes en cascade).
function songMatches(s: Song, filters: Filters, q: string, exclude?: FilterKey): boolean {
  if (!songMatchesText(s, q)) return false;
  return (Object.keys(filters) as FilterKey[]).every((key) => key === exclude || songMatchesFilter(s, key, filters[key]));
}

export function SongsList() {
  const { t } = useTranslation("songs");
  useDocumentTitle(t("list.title"));
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
    const q = query.trim().toLowerCase();
    const uniq = (values: (string | null | undefined)[]) =>
      Array.from(new Set(values.filter((v): v is string => !!v))).sort();
    const forKey = (key: FilterKey) => songs.filter((s) => songMatches(s, filters, q, key));
    return {
      artists: uniq(forKey("artist").map((s) => s.artist?.name)),
      categories: uniq(forKey("category").map((s) => s.category?.name)),
      languages: uniq(forKey("language").map((s) => s.language)),
      keys: uniq(forKey("key").map((s) => s.original_key)),
      years: uniq(forKey("year").map((s) => s.year?.toString())),
      difficulties: DIFFICULTIES.filter((d) => forKey("difficulty").some((s) => s.difficulty === d)),
    };
  }, [songs, filters, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = songs.filter((s) => songMatches(s, filters, q));

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
          <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{t("list.title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("list.resultsCount", { count: filtered.length })}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3">
        <div className="relative max-w-lg">
          <Search size={16} strokeWidth={1.8} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("list.searchPlaceholder")}
            className="w-full rounded-xl border border-border bg-surface-raised py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filters.artist}
            onChange={(e) => setFilters((f) => ({ ...f, artist: e.target.value }))}
            className={selectClasses}
          >
            <option value="">{t("list.filters.allArtists")}</option>
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
            <option value="">{t("list.filters.allCategories")}</option>
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
            <option value="">{t("list.filters.allLanguages")}</option>
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
            <option value="">{t("list.filters.allKeys")}</option>
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
            <option value="">{t("list.filters.allDifficulties")}</option>
            {options.difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={filters.year}
            onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
            className={selectClasses}
          >
            <option value="">{t("list.filters.allYears")}</option>
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
            <option value="">{t("list.filters.chordsIndifferent")}</option>
            <option value="avec">{t("list.filters.chordsWith")}</option>
            <option value="sans">{t("list.filters.chordsWithout")}</option>
          </select>
          <select
            value={filters.video}
            onChange={(e) => setFilters((f) => ({ ...f, video: e.target.value }))}
            className={selectClasses}
          >
            <option value="">{t("list.filters.videoIndifferent")}</option>
            <option value="avec">{t("list.filters.videoWith")}</option>
            <option value="sans">{t("list.filters.videoWithout")}</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className={selectClasses}
          >
            <option value="recent">{t("list.filters.sortRecent")}</option>
            <option value="az">{t("list.filters.sortAz")}</option>
            <option value="artist">{t("list.filters.sortArtist")}</option>
          </select>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={resetFilters} className="!px-3">
              <RotateCcw size={15} strokeWidth={1.8} />
              {t("list.filters.reset")}
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
          title={t("list.loadError.title")}
          description={t("list.loadError.description")}
          action={<Button onClick={load}>{t("list.loadError.retry")}</Button>}
        />
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={Search}
          title={t("list.empty.title")}
          description={t("list.empty.description")}
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={resetFilters}>
                {t("list.empty.resetFilters")}
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
                {t("list.loadMore", { count: filtered.length - visibleCount })}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
