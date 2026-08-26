import { supabase } from "./supabaseClient";
import type { Artist, Category, Song } from "../types/catalog";
import type { Section, VersionEntry } from "../types/editor";

const SONG_SELECT = "*, artist:artists(id,name), category:categories(id,name)";

export async function listSongs(): Promise<Song[]> {
  const { data, error } = await supabase
    .from("songs")
    .select(SONG_SELECT)
    .eq("status", "publie")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Song[];
}

export async function listSongsByArtist(artistId: string): Promise<Song[]> {
  const { data, error } = await supabase
    .from("songs")
    .select(SONG_SELECT)
    .eq("artist_id", artistId)
    .eq("status", "publie")
    .order("title");
  if (error) throw error;
  return (data ?? []) as unknown as Song[];
}

export async function listSongsByCategory(categoryId: string): Promise<Song[]> {
  const { data, error } = await supabase
    .from("songs")
    .select(SONG_SELECT)
    .eq("category_id", categoryId)
    .eq("status", "publie")
    .order("title");
  if (error) throw error;
  return (data ?? []) as unknown as Song[];
}

export async function getSong(id: string): Promise<Song | null> {
  const { data, error } = await supabase.from("songs").select(SONG_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return data as unknown as Song | null;
}

export async function listArtists(): Promise<Artist[]> {
  const { data, error } = await supabase.from("artists").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getArtist(id: string): Promise<Artist | null> {
  const { data, error } = await supabase.from("artists").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getCategory(id: string): Promise<Category | null> {
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export interface SongStructureUpdate {
  structure: Section[];
  original_key: string;
  tempo: string;
  version: string;
  version_history: VersionEntry[];
}

export async function saveSongStructure(id: string, update: SongStructureUpdate): Promise<void> {
  const { error } = await supabase.from("songs").update(update).eq("id", id);
  if (error) throw error;
}
