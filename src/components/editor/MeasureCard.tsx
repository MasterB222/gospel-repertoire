import clsx from "clsx";
import type { Measure } from "../../types/editor";

export function MeasureCard({
  measure,
  selected,
  onClick,
}: {
  measure: Measure;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex h-28 w-36 shrink-0 flex-col justify-between rounded-xl border p-2.5 text-left transition-colors",
        selected ? "border-accent bg-accent/10" : "border-border bg-surface-raised hover:border-accent/40"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-muted">#{measure.number}</span>
        {measure.annotations.length > 0 && (
          <span className="rounded-full bg-accent/20 px-1.5 text-[10px] text-accent">
            {measure.annotations.length}
          </span>
        )}
      </div>
      <p className="truncate text-sm font-semibold text-accent">{measure.chord || "—"}</p>
      <p className="truncate text-xs text-ink">{measure.lyrics || " "}</p>
      <p className="truncate text-[11px] text-muted">{measure.notes || " "}</p>
    </button>
  );
}
