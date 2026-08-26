import { Minus, Plus, RotateCcw } from "lucide-react";

interface TransposeControlProps {
  displayKey: string;
  pendingConfirm: boolean;
  canReset: boolean;
  onStep: (direction: 1 | -1) => void;
  onAnswer: (applyToChords: boolean) => void;
  onReset: () => void;
}

export function TransposeControl({ displayKey, pendingConfirm, canReset, onStep, onAnswer, onReset }: TransposeControlProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onStep(-1)}
          aria-label="Transposer d'un demi-ton vers le bas"
          className="rounded-lg border border-border p-1.5 text-ink hover:border-accent"
        >
          <Minus size={14} />
        </button>
        <span className="min-w-[4.5rem] text-center text-sm font-semibold text-ink">{displayKey || "—"}</span>
        <button
          onClick={() => onStep(1)}
          aria-label="Transposer d'un demi-ton vers le haut"
          className="rounded-lg border border-border p-1.5 text-ink hover:border-accent"
        >
          <Plus size={14} />
        </button>
        {canReset && (
          <button
            onClick={onReset}
            aria-label="Réinitialiser la tonalité"
            className="ml-1 flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted hover:text-ink"
          >
            <RotateCcw size={13} />
            Réinitialiser
          </button>
        )}
      </div>

      {pendingConfirm && (
        <div className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1.5 text-xs text-ink">
          Transposer les accords automatiquement ?
          <button onClick={() => onAnswer(true)} className="font-semibold text-accent-ink hover:underline">
            Oui
          </button>
          <button onClick={() => onAnswer(false)} className="text-muted hover:underline">
            Non
          </button>
        </div>
      )}
    </div>
  );
}
