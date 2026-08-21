export interface Artist {
  id: string;
  name: string;
  biography: string;
  image_url: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

export type Difficulty = "Facile" | "Intermédiaire" | "Avancé";

export interface Song {
  id: string;
  title: string;
  artist_id: string | null;
  category_id: string | null;
  language: string;
  original_key: string;
  tempo: string;
  difficulty: Difficulty;
  year: number | null;
  album: string;
  lyrics: string;
  chords: string;
  youtube_url: string;
  cover_url: string;
  structure: import("./editor").Section[];
  default_time_signature: string;
  version: string;
  version_history: import("./editor").VersionEntry[];
  created_at: string;
  updated_at: string;
  artist: Pick<Artist, "id" | "name"> | null;
  category: Pick<Category, "id" | "name"> | null;
}
