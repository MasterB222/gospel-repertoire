import clsx from "clsx";
import { Delete, Eraser, Play, Square } from "lucide-react";
import type { NoteDuration, Section } from "../../types/editor";
import { DurationPicker } from "./DurationPicker";
import { Metronome } from "./Metronome";
import { PianoKeyboard } from "./PianoKeyboard";
import { StaffRenderer } from "./StaffRenderer";
import { parseTimeSignature } from "../../lib/notation";

interface NotationEditorPanelProps {
  section: Section | null;
  selectedMeasureNumber: number | null;
  onSelectMeasure: (n: number) => void;
  duration: NoteDuration;
  dotted: boolean;
  onChangeDuration: (d: NoteDuration) => void;
  onToggleDotted: () => void;
  onPlayNote: (pitch: string) => void;
  onAddRest: () => void;
  onClearLastNote: () => void;
  onClearMeasureScore: () => void;
  bpm: number;
  isPlayingMelody: boolean;
  onTogglePlayMelody: () => void;
}

export function NotationEditorPanel({
  section,
  selectedMeasureNumber,
  onSelectMeasure,
  duration,
  dotted,
  onChangeDuration,
  onToggleDotted,
  onPlayNote,
  onAddRest,
  onClearLastNote,
  onClearMeasureScore,
  bpm,
  isPlayingMelody,
  onTogglePlayMelody,
}: NotationEditorPanelProps) {
  if (!section) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        Sélectionne ou crée une section pour commencer à noter la mélodie.
      </div>
    );
  }

  const { beats } = parseTimeSignature(section.time_signature);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-lg font-semibold text-ink">{section.name}</h2>
        <span className="text-xs text-muted">{section.time_signature ?? "4/4"}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DurationPicker duration={duration} dotted={dotted} onChangeDuration={onChangeDuration} onToggleDotted={onToggleDotted} onAddRest={onAddRest} />
        <Metronome bpm={bpm} beatsPerMeasure={beats} />
        <button
          type="button"
          onClick={onTogglePlayMelody}
          className={clsx(
            "flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold",
            isPlayingMelody ? "border-accent bg-accent/20 text-accent" : "border-border text-ink hover:border-accent/40"
          )}
        >
          {isPlayingMelody ? <Square size={13} /> : <Play size={13} />}
          {isPlayingMelody ? "Stop" : "Écouter la section"}
        </button>
        <button
          type="button"
          onClick={onClearLastNote}
          title="Effacer la dernière note de la mesure sélectionnée"
          className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink hover:border-accent/40"
        >
          <Delete size={13} />
          Dernière note
        </button>
        <button
          type="button"
          onClick={onClearMeasureScore}
          title="Vider la mesure sélectionnée"
          className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink hover:border-accent/40"
        >
          <Eraser size={13} />
          Vider la mesure
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {section.measures.map((m) => (
          <button
            key={m.number}
            type="button"
            onClick={() => onSelectMeasure(m.number)}
            className={clsx(
              "rounded-lg border px-2.5 py-1 text-xs font-semibold",
              m.number === selectedMeasureNumber ? "border-accent bg-accent/20 text-accent" : "border-border text-muted hover:border-accent/40"
            )}
          >
            #{m.number}
          </button>
        ))}
      </div>

      <StaffRenderer measures={section.measures} timeSignature={section.time_signature ?? "4/4"} selectedMeasureNumber={selectedMeasureNumber} />

      {selectedMeasureNumber == null ? (
        <p className="text-sm text-muted">Sélectionne une mesure ci-dessus, puis joue sur le piano pour écrire la mélodie.</p>
      ) : (
        <PianoKeyboard fromOctave={3} toOctave={5} onPlay={onPlayNote} />
      )}
    </div>
  );
}
