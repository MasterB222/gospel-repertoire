import { Construction } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState";

interface PlaceholderProps {
  title: string;
  phase: string;
}

export function Placeholder({ title, phase }: PlaceholderProps) {
  return (
    <EmptyState
      icon={Construction}
      title={title}
      description={`Cet écran sera construit en ${phase}, dans l'ordre de développement prévu.`}
    />
  );
}
