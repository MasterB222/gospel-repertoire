import { supabase } from "./supabaseClient";
import type { Artist, Category, Song, SongStatus, Difficulty } from "../types/catalog";
import type { UserRole } from "../context/AuthContext";

const SONG_SELECT = "*, artist:artists(id,name), category:categories(id,name)";

export async function listAllSongs(): Promise<Song[]> {
  const { data, error } = await supabase.from("songs").select(SONG_SELECT).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Song[];
}

export interface SongInput {
  title: string;
  artist_id: string | null;
  category_id: string | null;
  language: string;
  original_key: string;
  tempo: string;
  difficulty: Difficulty;
  year: number | null;
  album: string;
  description: string;
  lyrics: string;
  chords: string;
  youtube_url: string;
  cover_url: string;
  partition_url: string;
  tags: string[];
  status: SongStatus;
}

export async function createSong(input: SongInput): Promise<Song> {
  const { data, error } = await supabase.from("songs").insert(input).select(SONG_SELECT).single();
  if (error) throw error;
  return data as unknown as Song;
}

export async function updateSong(id: string, input: SongInput): Promise<void> {
  const { error } = await supabase.from("songs").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteSong(id: string): Promise<void> {
  const { error } = await supabase.from("songs").delete().eq("id", id);
  if (error) throw error;
}

export interface EntityInput {
  name: string;
  description: string;
  image_url: string;
}

export async function createArtist(input: EntityInput): Promise<Artist> {
  const { data, error } = await supabase
    .from("artists")
    .insert({ name: input.name, biography: input.description, image_url: input.image_url })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateArtist(id: string, input: EntityInput): Promise<void> {
  const { error } = await supabase
    .from("artists")
    .update({ name: input.name, biography: input.description, image_url: input.image_url })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteArtist(id: string): Promise<void> {
  const { error } = await supabase.from("artists").delete().eq("id", id);
  if (error) throw error;
}

export async function createCategory(input: EntityInput): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert({ name: input.name, description: input.description, image_url: input.image_url })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, input: EntityInput): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .update({ name: input.name, description: input.description, image_url: input.image_url })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export interface AdminProfile {
  id: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  created_at: string;
  active: boolean;
}

export async function listAllProfiles(): Promise<AdminProfile[]> {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function updateUserRole(id: string, role: UserRole): Promise<void> {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) throw error;
}

export async function setUserActive(id: string, active: boolean): Promise<void> {
  const { error } = await supabase.from("profiles").update({ active }).eq("id", id);
  if (error) throw error;
}

/**
 * Suppression définitive du compte via l'Edge Function `delete-user`
 * (supabase/functions/delete-user) — doit être déployée séparément, voir
 * ses instructions. Sans déploiement, l'appel échoue avec une erreur claire.
 */
export async function deleteUserAccount(id: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Session expirée.");

  let res: Response;
  try {
    res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId: id }),
    });
  } catch {
    throw new Error("La fonction de suppression n'est pas encore déployée. Voir les instructions fournies.");
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      res.status === 404
        ? "La fonction de suppression n'est pas encore déployée. Voir les instructions fournies."
        : `Échec de la suppression (${res.status}) : ${body}`
    );
  }
}

export interface AdminStats {
  songs: number;
  drafts: number;
  artists: number;
  categories: number;
  users: number;
  playlists: number;
  favorites: number;
  songsByCategory: { name: string; count: number }[];
  usersByRole: { name: string; count: number }[];
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Responsable",
  chef_choeur: "Chef de chœur",
  musicien: "Musicien",
  chanteur: "Chanteur",
  choriste: "Choriste",
  utilisateur: "Utilisateur",
};

export async function getAdminStats(): Promise<AdminStats> {
  const [songsRes, artistsRes, categoriesRes, profilesRes, playlistsRes, favoritesRes] = await Promise.all([
    supabase.from("songs").select("status, category:categories(name)"),
    supabase.from("artists").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("role"),
    supabase.from("playlists").select("id", { count: "exact", head: true }),
    supabase.from("favorites").select("user_id", { count: "exact", head: true }),
  ]);

  const songs = (songsRes.data ?? []) as unknown as { status: string; category: { name: string } | null }[];
  const profiles = (profilesRes.data ?? []) as { role: string }[];

  const byCategory = new Map<string, number>();
  songs.forEach((s) => {
    const name = s.category?.name ?? "Sans catégorie";
    byCategory.set(name, (byCategory.get(name) ?? 0) + 1);
  });

  const byRole = new Map<string, number>();
  profiles.forEach((p) => {
    const label = ROLE_LABELS[p.role] ?? p.role;
    byRole.set(label, (byRole.get(label) ?? 0) + 1);
  });

  return {
    songs: songs.length,
    drafts: songs.filter((s) => s.status === "brouillon").length,
    artists: artistsRes.count ?? 0,
    categories: categoriesRes.count ?? 0,
    users: profiles.length,
    playlists: playlistsRes.count ?? 0,
    favorites: favoritesRes.count ?? 0,
    songsByCategory: Array.from(byCategory, ([name, count]) => ({ name, count })),
    usersByRole: Array.from(byRole, ([name, count]) => ({ name, count })),
  };
}
