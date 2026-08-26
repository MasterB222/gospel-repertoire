import clsx from "clsx";
import type { NoteDuration } from "../../types/editor";

const DURATIONS: { value: NoteDuration; label: string; symbol: string }[] = [
  { value: "whole", label: "Ronde", symbol: "𝅝" },
  { value: "half", label: "Blanche", symbol: "𝅗𝅥" },
  { value: "quarter", label: "Noire", symbol: "♩" },
  { value: "eighth", label: "Croche", symbol: "♪" },
  { value: "sixteenth", label: "Double croche", symbol: "𝅘𝅥𝅯" },
];

interface DurationPickerProps {
  duration: NoteDuration;
  dotted: boolean;
  onChangeDuration: (d: NoteDuration) => void;
  onToggleDotted: () => void;
  onAddRest: () => void;
}

export function DurationPicker({ duration, dotted, onChangeDuration, onToggleDotted, onAddRest }: DurationPickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {DURATIONS.map((d) => (
        <button
          key={d.value}
          type="button"
          title={d.label}
          onClick={() => onChangeDuration(d.value)}
          className={clsx(
            "flex h-9 w-9 items-center justify-center rounded-lg border text-lg",
            duration === d.value ? "border-accent bg-accent/20 text-accent-ink" : "border-border text-ink hover:border-accent/40"
          )}
        >
          {d.symbol}
        </button>
      ))}
      <button
        type="button"
        title="Note pointée"
        onClick={onToggleDotted}
        className={clsx(
          "flex h-9 items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold",
          dotted ? "border-accent bg-accent/20 text-accent-ink" : "border-border text-ink hover:border-accent/40"
        )}
      >
        ·pointée
      </button>
      <button
        type="button"
        title="Ajouter un silence de la durée sélectionnée"
        onClick={onAddRest}
        className="flex h-9 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink hover:border-accent/40"
      >
        𝄽 silence
      </button>
    </div>
  );
}
