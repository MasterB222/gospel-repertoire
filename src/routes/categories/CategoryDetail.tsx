import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { CoverPlaceholder } from "../../components/catalog/CoverPlaceholder";
import { SongCard } from "../../components/catalog/SongCard";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { getCategory, listSongsByCategory } from "../../lib/catalog";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { Category, Song } from "../../types/catalog";

export function CategoryDetail() {
  const { t } = useTranslation("songs");
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null | undefined>(undefined);
  const [songs, setSongs] = useState<Song[]>([]);
  useDocumentTitle(category?.name);

  useEffect(() => {
    if (!id) return;
    setCategory(undefined);
    Promise.all([getCategory(id), listSongsByCategory(id)])
      .then(([c, s]) => {
        setCategory(c);
        setSongs(s);
      })
      .catch(() => setCategory(null));
  }, [id]);

  if (category === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-8 w-1/3" />
      </div>
    );
  }

  if (category === null) {
    return (
      <EmptyState
        icon={LayoutGrid}
        title={t("categories.notFoundTitle")}
        action={
          <Link to="/categories" className="text-sm font-semibold text-accent-ink hover:underline">
            {t("categories.backToCategories")}
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <Link to="/categories" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} strokeWidth={1.8} />
        {t("categories.backToCategories")}
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-border">
          <CoverPlaceholder icon={LayoutGrid} imageUrl={category.image_url || undefined} alt={category.name} />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ink">{category.name}</h1>
          {category.description && <p className="mt-2 max-w-xl text-sm text-muted">{category.description}</p>}
        </div>
      </div>

      <h2 className="mb-4 mt-10 font-serif text-lg font-semibold text-ink">
        {t("categories.songCount", { count: songs.length })}
      </h2>

      {songs.length === 0 ? (
        <EmptyState icon={LayoutGrid} title={t("categories.noSongsInCategory")} />
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
