import { useState } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import { ANNOTATION_MARKERS } from "../../lib/annotationMarkers";
import { noteToDisplay } from "../../lib/music";
import { playTone, vexKeyToFrequency, vexKeyToLetter } from "../../lib/notation";
import { PianoKeyboard } from "../notation/PianoKeyboard";
import { createEmptyNashvilleMark, type Annotation, type AnnotationType, type Measure, type NashvilleMark, type NoteNotation, type Section } from "../../types/editor";

const fieldClasses =
  "w-full rounded-lg border border-border bg-surface-raised px-2.5 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

interface PropertiesPanelProps {
  section: Section | null;
  measure: Measure | null;
  notation: NoteNotation;
  authorName: string;
  onUpdateMeasure: (patch: Partial<Measure>) => void;
  onAddAnnotation: (annotation: Omit<Annotation, "id" | "author">) => void;
  onRemoveAnnotation: (annotationId: string) => void;
  onUpdateSectionAssignment: (text: string) => void;
}

function NashvilleMarkEditor({
  label,
  mark,
  onChange,
}: {
  label: string;
  mark: NashvilleMark;
  onChange: (mark: NashvilleMark) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-raised px-2 py-1.5 text-xs">
      <span className="text-muted">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          title="Tenue (losange)"
          onClick={() => onChange({ ...mark, hold: !mark.hold })}
          className={clsx(
            "rounded px-1.5 py-0.5",
            mark.hold ? "bg-accent text-[#2A0F1E] font-semibold" : "border border-border text-ink hover:border-accent"
          )}
        >
          ◇
        </button>
        <button
          type="button"
          title="Anticipation (push)"
          onClick={() => onChange({ ...mark, push: !mark.push })}
          className={clsx(
            "rounded px-1.5 py-0.5",
            mark.push ? "bg-accent text-[#2A0F1E] font-semibold" : "border border-border text-ink hover:border-accent"
          )}
        >
          ^
        </button>
        <button
          type="button"
          title="Retirer une barre rythmique"
          onClick={() => onChange({ ...mark, slashes: Math.max(0, mark.slashes - 1) })}
          className="rounded border border-border px-1.5 py-0.5 text-ink hover:border-accent"
        >
          −
        </button>
        <span className="w-6 text-center font-semibold text-accent">{"/".repeat(mark.slashes) || "0"}</span>
        <button
          type="button"
          title="Ajouter une barre rythmique"
          onClick={() => onChange({ ...mark, slashes: Math.min(3, mark.slashes + 1) })}
          className="rounded border border-border px-1.5 py-0.5 text-ink hover:border-accent"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function PropertiesPanel({
  section,
  measure,
  notation,
  onUpdateMeasure,
  onAddAnnotation,
  onRemoveAnnotation,
  onUpdateSectionAssignment,
}: PropertiesPanelProps) {
  const [annotationType, setAnnotationType] = useState<AnnotationType>("chant");
  const [annotationMarker, setAnnotationMarker] = useState("");
  const [annotationText, setAnnotationText] = useState("");

  if (!section) {
    return <p className="p-4 text-sm text-muted">Sélectionne une section pour commencer.</p>;
  }

  function submitAnnotation() {
    if (!annotationText.trim() && !annotationMarker) return;
    onAddAnnotation({ type: annotationType, marker: annotationMarker || undefined, text: annotationText.trim() });
    setAnnotationText("");
    setAnnotationMarker("");
  }

  return (
    <div className="space-y-5 p-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-muted">Assigné à (section entière)</label>
        <input
          value={section.assigned_to ?? ""}
          onChange={(e) => onUpdateSectionAssignment(e.target.value)}
          placeholder="ex. Pupitre Ténors, Paul..."
          className={fieldClasses}
        />
      </div>

      {!measure ? (
        <p className="text-sm text-muted">Sélectionne une mesure pour l'éditer.</p>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Mesure #{measure.number}</p>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">Accord</label>
            <input
              value={measure.chord}
              onChange={(e) => onUpdateMeasure({ chord: e.target.value })}
              placeholder="ex. Cm7, G/B..."
              className={fieldClasses}
            />
          </div>

          {notation === "nashville" && (
            <div className="space-y-2 rounded-lg border border-border p-2.5">
              <p className="text-xs font-semibold text-muted">Rythme Nashville</p>
              <NashvilleMarkEditor
                label={measure.chord ? "Accord 1" : "Accord"}
                mark={measure.nashvilleMark ?? createEmptyNashvilleMark()}
                onChange={(mark) => onUpdateMeasure({ nashvilleMark: mark })}
              />

              {measure.chord2 !== undefined ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted">Accord 2 (mesure fractionnée)</label>
                    <div className="flex gap-1.5">
                      <input
                        value={measure.chord2}
                        onChange={(e) => onUpdateMeasure({ chord2: e.target.value })}
                        placeholder="ex. F..."
                        className={fieldClasses}
                      />
                      <button
                        type="button"
                        onClick={() => onUpdateMeasure({ chord2: undefined, nashvilleMark2: undefined })}
                        className="shrink-0 rounded-lg border border-border px-2 text-xs text-ink hover:border-accent"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                  <NashvilleMarkEditor
                    label="Accord 2"
                    mark={measure.nashvilleMark2 ?? createEmptyNashvilleMark()}
                    onChange={(mark) => onUpdateMeasure({ nashvilleMark2: mark })}
                  />
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => onUpdateMeasure({ chord2: "" })}
                  className="w-full rounded-lg border border-dashed border-border py-1.5 text-xs text-muted hover:border-accent hover:text-accent"
                >
                  + Fractionner la mesure (2 accords)
                </button>
              )}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">Paroles</label>
            <textarea
              value={measure.lyrics}
              onChange={(e) => onUpdateMeasure({ lyrics: e.target.value })}
              rows={2}
              className={fieldClasses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">Notes</label>
            <input
              value={measure.notes}
              onChange={(e) => onUpdateMeasure({ notes: e.target.value })}
              placeholder="do ré mi..."
              className={fieldClasses}
            />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-muted">Piano — clique pour ajouter une note</p>
            <PianoKeyboard
              fromOctave={3}
              toOctave={5}
              onPlay={(vexKey) => {
                playTone(vexKeyToFrequency(vexKey), 0.35, { gain: 0.2 });
                const display = noteToDisplay(vexKeyToLetter(vexKey), notation);
                onUpdateMeasure({ notes: measure.notes ? `${measure.notes} ${display}` : display });
              }}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-muted">Annotations</p>
            <div className="space-y-1.5">
              {measure.annotations.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg bg-surface-raised px-2.5 py-1.5 text-xs">
                  <span className="min-w-0 truncate text-ink">
                    {a.marker && <strong className="text-accent">{a.marker}</strong>} {a.text}
                  </span>
                  <button onClick={() => onRemoveAnnotation(a.id)} className="shrink-0 text-muted hover:text-danger">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-2 space-y-1.5 rounded-lg border border-border p-2">
              <div className="flex gap-1.5">
                {(Object.keys(ANNOTATION_MARKERS) as (keyof typeof ANNOTATION_MARKERS)[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setAnnotationType(t);
                      setAnnotationMarker("");
                    }}
                    className={`rounded-full px-2 py-1 text-[11px] ${
                      annotationType === t ? "bg-accent/20 text-accent" : "text-muted hover:bg-surface-raised"
                    }`}
                  >
                    {ANNOTATION_MARKERS[t].emoji} {ANNOTATION_MARKERS[t].label}
                  </button>
                ))}
              </div>
              <select
                value={annotationMarker}
                onChange={(e) => setAnnotationMarker(e.target.value)}
                className={fieldClasses}
              >
                <option value="">Marqueur (optionnel)</option>
                {ANNOTATION_MARKERS[annotationType as keyof typeof ANNOTATION_MARKERS].markers.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                value={annotationText}
                onChange={(e) => setAnnotationText(e.target.value)}
                placeholder='ex. "Les ténors entrent ici"'
                className={fieldClasses}
              />
              <button
                onClick={submitAnnotation}
                className="w-full rounded-lg bg-accent py-1.5 text-xs font-semibold text-[#2A0F1E] hover:bg-accent-soft"
              >
                Ajouter l'annotation
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
