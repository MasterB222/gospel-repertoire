import type { NoteDuration, ScoreNote } from "../types/editor";

/** Fraction d'une ronde occupée par chaque durée (avant point éventuel). */
const DURATION_FRACTION: Record<NoteDuration, number> = {
  whole: 1,
  half: 1 / 2,
  quarter: 1 / 4,
  eighth: 1 / 8,
  sixteenth: 1 / 16,
};

/** Code VexFlow correspondant ("q", "qr" pour un silence...). */
export const VEXFLOW_DURATION: Record<NoteDuration, string> = {
  whole: "w",
  half: "h",
  quarter: "q",
  eighth: "8",
  sixteenth: "16",
};

export function noteFraction(note: Pick<ScoreNote, "duration" | "dotted">): number {
  const base = DURATION_FRACTION[note.duration];
  return note.dotted ? base * 1.5 : base;
}

export function vexflowDuration(note: Pick<ScoreNote, "duration" | "dotted" | "pitch">): string {
  const code = VEXFLOW_DURATION[note.duration];
  const rest = note.pitch === null ? "r" : "";
  return `${code}${rest}`;
}

/** "4/4" -> capacité de 1 ronde ; "6/8" -> 0.75 ronde ; "3/4" -> 0.75 ronde. */
export function parseTimeSignature(sig: string | undefined): { beats: number; unit: number; capacity: number } {
  const match = (sig ?? "4/4").trim().match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!match) return { beats: 4, unit: 4, capacity: 1 };
  const beats = parseInt(match[1], 10);
  const unit = parseInt(match[2], 10);
  return { beats, unit, capacity: beats / unit };
}

export function measureFilledFraction(notes: ScoreNote[] | undefined): number {
  return (notes ?? []).reduce((sum, n) => sum + noteFraction(n), 0);
}

export function measureIsFull(notes: ScoreNote[] | undefined, timeSignature: string | undefined): boolean {
  const { capacity } = parseTimeSignature(timeSignature);
  return measureFilledFraction(notes) >= capacity - 1e-9;
}

export function remainingFraction(notes: ScoreNote[] | undefined, timeSignature: string | undefined): number {
  const { capacity } = parseTimeSignature(timeSignature);
  return Math.max(0, capacity - measureFilledFraction(notes));
}

const CHROMATIC_SHARP = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];

/** Numéro MIDI depuis un piano touche (ex. touche blanche "C", octave 4). */
export function pitchToMidi(letter: string, accidental: "" | "#", octave: number): number {
  const index = CHROMATIC_SHARP.indexOf((letter.toLowerCase() + accidental) as string);
  return (octave + 1) * 12 + index;
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** "c/4" -> fréquence en Hz, pour la lecture audio. */
export function vexKeyToFrequency(key: string): number {
  const [pitchPart, octaveStr] = key.split("/");
  const octave = parseInt(octaveStr, 10);
  const letter = pitchPart[0];
  const accidental = pitchPart.includes("#") ? "#" : "";
  const midi = pitchToMidi(letter, accidental, octave);
  return midiToFrequency(midi);
}

export function createEmptyScoreNote(pitch: string | null, duration: NoteDuration = "quarter"): ScoreNote {
  return { id: crypto.randomUUID(), pitch, duration, dotted: false };
}

/** Durée réelle d'une noire, en secondes, pour un tempo donné (BPM = noires/minute). */
export function quarterNoteSeconds(bpm: number): number {
  return 60 / Math.max(20, bpm || 90);
}

export function noteDurationSeconds(note: Pick<ScoreNote, "duration" | "dotted">, bpm: number): number {
  return noteFraction(note) * 4 * quarterNoteSeconds(bpm);
}

let sharedAudioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!sharedAudioCtx) sharedAudioCtx = new AudioContext();
  return sharedAudioCtx;
}

/** Joue un bip synthétisé (note ou clic de métronome) via Web Audio, sans dépendance externe. */
export function playTone(frequency: number, durationSeconds: number, options?: { gain?: number; type?: OscillatorType }): void {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = options?.type ?? "sine";
  osc.frequency.value = frequency;
  const peak = options?.gain ?? 0.2;
  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(peak, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);
  osc.connect(gainNode).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + durationSeconds + 0.02);
}

export function playMetronomeClick(accent: boolean): void {
  playTone(accent ? 1500 : 1000, 0.06, { gain: accent ? 0.3 : 0.18, type: "square" });
}

/** Joue une suite de notes/silences en séquence (mélodie saisie), au tempo donné. */
export function playMelody(notes: ScoreNote[], bpm: number, onNoteStart?: (index: number) => void): { stop: () => void } {
  let cancelled = false;
  const timers: number[] = [];
  let elapsed = 0;
  notes.forEach((note, i) => {
    const duration = noteDurationSeconds(note, bpm);
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      onNoteStart?.(i);
      if (note.pitch) playTone(vexKeyToFrequency(note.pitch), duration * 0.92, { gain: 0.22 });
    }, elapsed * 1000);
    timers.push(timer);
    elapsed += duration;
  });
  return {
    stop: () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    },
  };
}
