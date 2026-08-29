import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SearchX } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function NotFound() {
  const { t } = useTranslation("pages");
  useDocumentTitle(t("notFound.title"));
  return (
    <EmptyState
      icon={SearchX}
      title={t("notFound.title")}
      description={t("notFound.description")}
      action={
        <Link to="/" className="text-sm font-semibold text-accent-ink hover:underline">
          {t("notFound.backHome")}
        </Link>
      }
    />
  );
}
