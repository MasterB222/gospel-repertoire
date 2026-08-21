import type { AnnotationType } from "../types/editor";

export const ANNOTATION_MARKERS: Record<Exclude<AnnotationType, "libre">, { emoji: string; label: string; markers: string[] }> = {
  chant: {
    emoji: "🎤",
    label: "Chant",
    markers: ["Entrée voix", "Solo", "Chœur", "Réponse", "Unisson", "Harmonisation"],
  },
  instrument: {
    emoji: "🎹",
    label: "Instrument",
    markers: ["Piano", "Guitare", "Basse", "Batterie", "Clavier", "Cuivres"],
  },
  dynamique: {
    emoji: "🎚️",
    label: "Dynamique",
    markers: ["Piano (p)", "Mezzo (mf)", "Forte (f)", "Crescendo", "Decrescendo"],
  },
};
