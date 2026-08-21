import { Link } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import { MediaCard } from "../ui/Card";
import { CoverPlaceholder } from "./CoverPlaceholder";
import type { Category } from "../../types/catalog";

export function CategoryCard({ category, songCount }: { category: Category; songCount: number }) {
  return (
    <Link to={`/categories/${category.id}`} className="block">
      <MediaCard
        media={<CoverPlaceholder icon={LayoutGrid} imageUrl={category.image_url || undefined} alt={category.name} />}
        title={category.name}
        subtitle={`${songCount} chanson${songCount > 1 ? "s" : ""}`}
      />
    </Link>
  );
}
