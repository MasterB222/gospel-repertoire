import { useEffect, useRef } from "react";
import { Accidental, Dot, Formatter, Renderer, Stave, StaveNote, Voice } from "vexflow";
import clsx from "clsx";
import type { Measure, ScoreNote } from "../../types/editor";
import { parseTimeSignature, remainingFraction, vexflowDuration } from "../../lib/notation";

const MEASURE_WIDTH = 170;
const FIRST_MEASURE_WIDTH = 240;
const STAVE_HEIGHT = 110;
const TOP_MARGIN = 20;

/** Complète une mesure avec des silences pour occuper l'espace restant, uniquement pour le rendu. */
function notesForRender(measure: Measure, timeSignature: string): ScoreNote[] {
  const notes = [...(measure.score ?? [])];
  let remaining = remainingFraction(measure.score, timeSignature);
  const fillDurations: { duration: ScoreNote["duration"]; fraction: number }[] = [
    { duration: "whole", fraction: 1 },
    { duration: "half", fraction: 0.5 },
    { duration: "quarter", fraction: 0.25 },
    { duration: "eighth", fraction: 0.125 },
    { duration: "sixteenth", fraction: 0.0625 },
  ];
  let guard = 0;
  while (remaining > 1e-6 && guard < 32) {
    guard++;
    const fit = fillDurations.find((f) => f.fraction <= remaining + 1e-6);
    if (!fit) break;
    notes.push({ id: `pad-${guard}`, pitch: null, duration: fit.duration, dotted: false });
    remaining -= fit.fraction;
  }
  if (notes.length === 0) notes.push({ id: "pad-empty", pitch: null, duration: "whole", dotted: false });
  return notes;
}

function buildStaveNote(note: ScoreNote, beats: number, unit: number): StaveNote {
  const keys = note.pitch ? [note.pitch] : ["b/4"];
  const staveNote = new StaveNote({ keys, duration: vexflowDuration(note), clef: "treble" });
  if (note.pitch?.includes("#")) staveNote.addModifier(new Accidental("#"), 0);
  if (note.dotted) Dot.buildAndAttach([staveNote], { all: true });
  void beats;
  void unit;
  return staveNote;
}

interface StaffRendererProps {
  measures: Measure[];
  timeSignature: string;
  selectedMeasureNumber: number | null;
  measuresPerRow?: number;
}

export function StaffRenderer({ measures, timeSignature, selectedMeasureNumber, measuresPerRow = 4 }: StaffRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";
    if (measures.length === 0) return;

    const { beats, unit } = parseTimeSignature(timeSignature);
    const rows = Math.ceil(measures.length / measuresPerRow);
    const rowWidth = FIRST_MEASURE_WIDTH + MEASURE_WIDTH * (measuresPerRow - 1) + 20;
    const totalHeight = rows * STAVE_HEIGHT + TOP_MARGIN;

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(rowWidth, totalHeight);
    const context = renderer.getContext();

    measures.forEach((measure, idx) => {
      const col = idx % measuresPerRow;
      const row = Math.floor(idx / measuresPerRow);
      const isFirstOfRow = col === 0;
      const width = isFirstOfRow ? FIRST_MEASURE_WIDTH : MEASURE_WIDTH;
      const x = isFirstOfRow ? 0 : FIRST_MEASURE_WIDTH + MEASURE_WIDTH * (col - 1);
      const y = row * STAVE_HEIGHT + TOP_MARGIN;

      if (measure.number === selectedMeasureNumber) {
        context.save();
        context.setFillStyle("rgba(212, 163, 115, 0.16)");
        context.fillRect(x, y - 5, width, STAVE_HEIGHT - 15);
        context.restore();
      }

      const stave = new Stave(x, y, width);
      if (isFirstOfRow) {
        stave.addClef("treble");
        stave.addTimeSignature(`${beats}/${unit}`);
      }
      stave.setContext(context).draw();

      const renderNotes = notesForRender(measure, timeSignature);
      const staveNotes = renderNotes.map((n) => buildStaveNote(n, beats, unit));
      try {
        const voice = new Voice({ numBeats: beats, beatValue: unit }).setStrict(false);
        voice.addTickables(staveNotes);
        new Formatter().joinVoices([voice]).format([voice], width - (isFirstOfRow ? 70 : 20));
        voice.draw(context, stave);
      } catch {
        // Mesure temporairement incohérente (saisie en cours) : on affiche juste la portée vide.
      }
    });
  }, [measures, timeSignature, selectedMeasureNumber, measuresPerRow]);

  return <div ref={containerRef} className={clsx("overflow-x-auto rounded-lg bg-white p-2")} />;
}
