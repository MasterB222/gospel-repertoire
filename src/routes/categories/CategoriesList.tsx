import { useEffect, useState } from "react";
import { LayoutGrid } from "lucide-react";
import { CategoryCard } from "../../components/catalog/CategoryCard";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { listCategories, listSongs } from "../../lib/catalog";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { Category, Song } from "../../types/catalog";

export function CategoriesList() {
  useDocumentTitle("Catégories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const [c, s] = await Promise.all([listCategories(), listSongs()]);
      setCategories(c);
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

  const countFor = (categoryId: string) => songs.filter((s) => s.category_id === categoryId).length;

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-ink sm:text-3xl">Catégories</h1>

      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full" />
          ))}
        </div>
      )}

      {!loading && error && (
        <EmptyState
          icon={LayoutGrid}
          title="Impossible de charger les catégories"
          description="Une erreur est survenue en contactant la base de données."
          action={<Button onClick={load}>Réessayer</Button>}
        />
      )}

      {!loading && !error && categories.length === 0 && (
        <EmptyState icon={LayoutGrid} title="Aucune catégorie pour l'instant" />
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} songCount={countFor(category.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
