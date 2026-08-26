export type AnnotationType = "chant" | "instrument" | "dynamique" | "libre";

export interface Annotation {
  id: string;
  type: AnnotationType;
  marker?: string;
  text: string;
  author: string;
}

export interface NashvilleMark {
  hold: boolean;
  push: boolean;
  slashes: number;
}

export function createEmptyNashvilleMark(): NashvilleMark {
  return { hold: false, push: false, slashes: 0 };
}

export type NoteDuration = "whole" | "half" | "quarter" | "eighth" | "sixteenth";

export interface ScoreNote {
  id: string;
  /** Hauteur au format VexFlow "c/4", "f#/5"... ou null pour un silence. */
  pitch: string | null;
  duration: NoteDuration;
  dotted: boolean;
}

export interface Measure {
  number: number;
  lyrics: string;
  chord: string;
  chord2?: string;
  notes: string;
  annotations: Annotation[];
  nashvilleMark?: NashvilleMark;
  nashvilleMark2?: NashvilleMark;
  score?: ScoreNote[];
}

export interface Section {
  id: string;
  name: string;
  order: number;
  hidden: boolean;
  time_signature?: string;
  assigned_to?: string;
  measures: Measure[];
}

export interface VersionEntry {
  version: string;
  author: string;
  at: string;
}

export type NoteNotation = "solfege" | "letters" | "nashville";

export function createEmptyMeasure(number: number): Measure {
  return { number, lyrics: "", chord: "", notes: "", annotations: [] };
}

export function createEmptySection(order: number, name = "Nouvelle section"): Section {
  return {
    id: crypto.randomUUID(),
    name,
    order,
    hidden: false,
    measures: [createEmptyMeasure(1), createEmptyMeasure(2), createEmptyMeasure(3), createEmptyMeasure(4)],
  };
}
