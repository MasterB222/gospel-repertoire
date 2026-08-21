import clsx from "clsx";
import type { Measure, NashvilleMark, NoteNotation } from "../../types/editor";
import { formatChordDisplay } from "../../lib/music";

export function NashvilleNumber({ text, mark }: { text: string; mark?: NashvilleMark }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {mark?.push && <span className="text-[10px] font-bold leading-none text-accent">^</span>}
      <span
        className={clsx(
          "relative inline-flex items-center justify-center px-1 leading-none",
          mark?.hold && "before:absolute before:inset-[-4px] before:rotate-45 before:rounded-[2px] before:border before:border-accent"
        )}
      >
        <span className="relative">{text}</span>
      </span>
      {mark && mark.slashes > 0 && (
        <span className="text-xs font-semibold tracking-widest text-accent/70">{"/".repeat(mark.slashes)}</span>
      )}
    </span>
  );
}

export function MeasureCard({
  measure,
  selected,
  notation,
  songKey,
  onClick,
}: {
  measure: Measure;
  selected: boolean;
  notation: NoteNotation;
  songKey: string;
  onClick: () => void;
}) {
  const isNashville = notation === "nashville";
  const chordDisplay = formatChordDisplay(measure.chord, notation, songKey);
  const chord2Display = measure.chord2 ? formatChordDisplay(measure.chord2, notation, songKey) : "";

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
      <p className="flex items-baseline gap-2 truncate text-sm font-semibold text-accent">
        {!measure.chord && !measure.chord2 ? (
          "—"
        ) : isNashville ? (
          <>
            <NashvilleNumber text={chordDisplay} mark={measure.nashvilleMark} />
            {measure.chord2 && (
              <span className="border-b border-accent/40 pb-0.5">
                <NashvilleNumber text={chord2Display} mark={measure.nashvilleMark2} />
              </span>
            )}
          </>
        ) : (
          <>
            {chordDisplay}
            {measure.chord2 && <span className="text-muted"> · {chord2Display}</span>}
          </>
        )}
      </p>
      <p className="truncate text-xs text-ink">{measure.lyrics || " "}</p>
      <p className="truncate text-[11px] text-muted">{measure.notes || " "}</p>
    </button>
  );
}
