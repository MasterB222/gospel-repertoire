import type { NoteNotation } from "../types/editor";

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_TO_SHARP: Record<string, string> = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
};

const SOLFEGE_TO_LETTER: Record<string, string> = {
  do: "C",
  "do#": "C#",
  ré: "D",
  re: "D",
  "ré#": "D#",
  "re#": "D#",
  mi: "E",
  fa: "F",
  "fa#": "F#",
  sol: "G",
  "sol#": "G#",
  la: "A",
  "la#": "A#",
  si: "B",
};
const LETTER_TO_SOLFEGE: Record<string, string> = {
  C: "do",
  "C#": "do#",
  D: "ré",
  "D#": "ré#",
  E: "mi",
  F: "fa",
  "F#": "fa#",
  G: "sol",
  "G#": "sol#",
  A: "la",
  "A#": "la#",
  B: "si",
};

export function noteToDisplay(letter: string, notation: NoteNotation): string {
  if (notation === "solfege") return LETTER_TO_SOLFEGE[letter] ?? letter;
  return letter;
}

export function parseNoteToken(token: string): string | null {
  const clean = token.trim().toLowerCase();
  if (!clean) return null;
  if (SOLFEGE_TO_LETTER[clean]) return SOLFEGE_TO_LETTER[clean];
  const candidate = token.trim()[0].toUpperCase() + token.trim().slice(1);
  if (CHROMATIC.includes(candidate)) return candidate;
  if (FLAT_TO_SHARP[candidate]) return FLAT_TO_SHARP[candidate];
  return candidate;
}

/** "do do sol fa" -> ["do", "do", "sol", "fa"], un mot par mesure disponible. */
export function distributeQuickEntry(text: string): string[] {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

const CHORD_RE = /^([A-Ga-g])([#b]?)((?:maj|min|dim|aug|sus|add|m|M)?[0-9]*(?:sus[24]?)?[^/]*)(\/([A-Ga-g])([#b]?))?$/;

function shiftRoot(root: string, accidental: string, semitones: number): string {
  const sharpRoot = accidental === "b" ? FLAT_TO_SHARP[root.toUpperCase() + "b"] : root.toUpperCase() + accidental;
  const normalizedRoot = FLAT_TO_SHARP[root.toUpperCase() + accidental] ?? sharpRoot ?? root.toUpperCase() + accidental;
  const index = CHROMATIC.indexOf(normalizedRoot);
  if (index === -1) return root.toUpperCase() + accidental;
  const shifted = (((index + semitones) % 12) + 12) % 12;
  return CHROMATIC[shifted];
}

/** Transpose un symbole d'accord (ex: "Cm7", "G/B", "F#maj7") de N demi-tons. La qualité (suffixe) est préservée telle quelle. */
export function transposeChord(chord: string, semitones: number): string {
  if (!chord.trim() || semitones === 0) return chord;
  const match = chord.trim().match(CHORD_RE);
  if (!match) return chord;
  const [, root, accidental, suffix, , bassRoot, bassAccidental] = match;
  const newRoot = shiftRoot(root, accidental, semitones);
  const newBass = bassRoot ? shiftRoot(bassRoot, bassAccidental ?? "", semitones) : "";
  return `${newRoot}${suffix ?? ""}${newBass ? "/" + newBass : ""}`;
}

/** Transpose toutes les lignes "Section: A - B - C" d'un bloc d'accords. */
export function transposeChordLine(line: string, semitones: number): string {
  return line
    .split(/(\s*-\s*|\s+)/)
    .map((token) => (/^[A-Ga-g]/.test(token) ? transposeChord(token, semitones) : token))
    .join("");
}

export function transposeKey(key: string, semitones: number): string {
  // Gère des tonalités du type "Sol majeur", "Mi mineur", "G", "Em"...
  const match = key.trim().match(/^([A-Ga-g]|do|ré|re|mi|fa|sol|la|si)([#b]?)(.*)$/i);
  if (!match) return key;
  const [, rootRaw, accidental, rest] = match;
  const letterRoot = parseNoteToken(rootRaw) ?? rootRaw.toUpperCase();
  const wasSolfege = !!SOLFEGE_TO_LETTER[rootRaw.toLowerCase()];
  const shifted = shiftRoot(letterRoot, accidental, semitones);
  const display = wasSolfege ? LETTER_TO_SOLFEGE[shifted] ?? shifted : shifted;
  return `${display}${rest}`;
}
