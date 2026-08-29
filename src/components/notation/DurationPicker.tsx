import clsx from "clsx";
import { useTranslation } from "react-i18next";
import type { NoteDuration } from "../../types/editor";

const DURATIONS: { value: NoteDuration; symbol: string }[] = [
  { value: "whole", symbol: "𝅝" },
  { value: "half", symbol: "𝅗𝅥" },
  { value: "quarter", symbol: "♩" },
  { value: "eighth", symbol: "♪" },
  { value: "sixteenth", symbol: "𝅘𝅥𝅯" },
];

interface DurationPickerProps {
  duration: NoteDuration;
  dotted: boolean;
  onChangeDuration: (d: NoteDuration) => void;
  onToggleDotted: () => void;
  onAddRest: () => void;
}

export function DurationPicker({ duration, dotted, onChangeDuration, onToggleDotted, onAddRest }: DurationPickerProps) {
  const { t } = useTranslation("editor");
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {DURATIONS.map((d) => (
        <button
          key={d.value}
          type="button"
          title={t(`durationPicker.durations.${d.value}`)}
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
        title={t("durationPicker.dotted")}
        onClick={onToggleDotted}
        className={clsx(
          "flex h-9 items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold",
          dotted ? "border-accent bg-accent/20 text-accent-ink" : "border-border text-ink hover:border-accent/40"
        )}
      >
        {t("durationPicker.dottedButton")}
      </button>
      <button
        type="button"
        title={t("durationPicker.addRestTitle")}
        onClick={onAddRest}
        className="flex h-9 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink hover:border-accent/40"
      >
        {t("durationPicker.addRestButton")}
      </button>
    </div>
  );
}
