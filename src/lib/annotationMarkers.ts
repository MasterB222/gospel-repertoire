import type { AnnotationType } from "../types/editor";

export const ANNOTATION_TYPES: Exclude<AnnotationType, "libre">[] = ["chant", "instrument", "dynamique"];

export const ANNOTATION_EMOJIS: Record<Exclude<AnnotationType, "libre">, string> = {
  chant: "🎤",
  instrument: "🎹",
  dynamique: "🎚️",
};
