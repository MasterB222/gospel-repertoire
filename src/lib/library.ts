import { supabase } from "./supabaseClient";
import type { Song } from "../types/catalog";
import type { HistoryEntry, Playlist, PlaylistSong } from "../types/library";

const SONG_JOIN = "song:songs(*, artist:artists(id,name), category:categories(id,name))";

export async function listFavoriteIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase.from("favorites").select("song_id").eq("user_id", userId);
  if (error) throw error;
  return new Set((data ?? []).map((f) => f.song_id));
}

export async function listFavoriteSongs(userId: string): Promise<Song[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select(SONG_JOIN)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as { song: Song }[]).map((r) => r.song);
}

export async function setFavorite(userId: string, songId: string, favorite: boolean): Promise<void> {
  if (favorite) {
    const { error } = await supabase.from("favorites").insert({ user_id: userId, song_id: songId });
    if (error) throw error;
  } else {
    const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("song_id", songId);
    if (error) throw error;
  }
}

export async function listPlaylists(userId: string): Promise<Playlist[]> {
  const { data, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPlaylist(id: string): Promise<Playlist | null> {
  const { data, error } = await supabase.from("playlists").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createPlaylist(userId: string, name: string, description: string): Promise<Playlist> {
  const { data, error } = await supabase
    .from("playlists")
    .insert({ user_id: userId, name, description })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function renamePlaylist(id: string, name: string, description: string): Promise<void> {
  const { error } = await supabase.from("playlists").update({ name, description }).eq("id", id);
  if (error) throw error;
}

export async function deletePlaylist(id: string): Promise<void> {
  const { error } = await supabase.from("playlists").delete().eq("id", id);
  if (error) throw error;
}

export async function listPlaylistSongs(playlistId: string): Promise<PlaylistSong[]> {
  const { data, error } = await supabase
    .from("playlist_songs")
    .select(`*, ${SONG_JOIN}`)
    .eq("playlist_id", playlistId)
    .order("position");
  if (error) throw error;
  return (data ?? []) as unknown as PlaylistSong[];
}

export async function addSongToPlaylist(playlistId: string, songId: string): Promise<void> {
  const { count } = await supabase
    .from("playlist_songs")
    .select("*", { count: "exact", head: true })
    .eq("playlist_id", playlistId);
  const { error } = await supabase
    .from("playlist_songs")
    .insert({ playlist_id: playlistId, song_id: songId, position: count ?? 0 });
  if (error) throw error;
}

export async function removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
  const { error } = await supabase
    .from("playlist_songs")
    .delete()
    .eq("playlist_id", playlistId)
    .eq("song_id", songId);
  if (error) throw error;
}

export async function reorderPlaylistSongs(playlistId: string, orderedSongIds: string[]): Promise<void> {
  await Promise.all(
    orderedSongIds.map((songId, position) =>
      supabase.from("playlist_songs").update({ position }).eq("playlist_id", playlistId).eq("song_id", songId)
    )
  );
}

export async function recordHistory(userId: string, songId: string): Promise<void> {
  const { error } = await supabase
    .from("history")
    .upsert({ user_id: userId, song_id: songId, viewed_at: new Date().toISOString() });
  if (error) throw error;
}

export async function listHistory(userId: string, limit = 50): Promise<HistoryEntry[]> {
  const { data, error } = await supabase
    .from("history")
    .select(`*, ${SONG_JOIN}`)
    .eq("user_id", userId)
    .order("viewed_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as HistoryEntry[];
}
