import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function NotFound() {
  useDocumentTitle("Page introuvable");
  return (
    <EmptyState
      icon={SearchX}
      title="Page introuvable"
      description="Cette adresse ne correspond à aucune page du site."
      action={
        <Link to="/" className="text-sm font-semibold text-accent-ink hover:underline">
          Retour à l'accueil
        </Link>
      }
    />
  );
}
