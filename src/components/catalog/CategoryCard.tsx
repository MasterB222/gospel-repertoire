import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutGrid } from "lucide-react";
import { MediaCard } from "../ui/Card";
import { CoverPlaceholder } from "./CoverPlaceholder";
import type { Category } from "../../types/catalog";

export function CategoryCard({ category, songCount }: { category: Category; songCount: number }) {
  const { t } = useTranslation("songs");
  return (
    <Link to={`/categories/${category.id}`} className="block">
      <MediaCard
        media={<CoverPlaceholder icon={LayoutGrid} imageUrl={category.image_url || undefined} alt={category.name} />}
        title={category.name}
        subtitle={t("categories.songCount", { count: songCount })}
      />
    </Link>
  );
}
