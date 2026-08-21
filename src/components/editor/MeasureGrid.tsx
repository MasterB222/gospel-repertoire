import { Plus } from "lucide-react";
import { MeasureCard } from "./MeasureCard";
import { QuickEntryBar } from "./QuickEntryBar";
import type { NoteNotation, Section } from "../../types/editor";

interface MeasureGridProps {
  section: Section | null;
  selectedMeasureNumber: number | null;
  notation: NoteNotation;
  songKey: string;
  onSelectMeasure: (number: number) => void;
  onQuickEntry: (text: string) => void;
  onAddMeasure: () => void;
}

export function MeasureGrid({
  section,
  selectedMeasureNumber,
  notation,
  songKey,
  onSelectMeasure,
  onQuickEntry,
  onAddMeasure,
}: MeasureGridProps) {
  if (!section) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        Sélectionne ou crée une section pour commencer à éditer.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold text-ink">{section.name}</h2>
        <span className="text-xs text-muted">{section.time_signature ?? "4/4"}</span>
      </div>

      <QuickEntryBar onSubmit={onQuickEntry} />

      <div className="flex gap-3 overflow-x-auto pb-3">
        {section.measures.map((measure) => (
          <MeasureCard
            key={measure.number}
            measure={measure}
            selected={selectedMeasureNumber === measure.number}
            notation={notation}
            songKey={songKey}
            onClick={() => onSelectMeasure(measure.number)}
          />
        ))}
        <button
          onClick={onAddMeasure}
          className="flex h-28 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-border text-muted hover:border-accent hover:text-accent"
          aria-label="Ajouter une mesure"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
