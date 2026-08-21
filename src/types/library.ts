import type { Song } from "./catalog";

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description: string;
  cover_url: string;
  created_at: string;
}

export interface PlaylistSong {
  playlist_id: string;
  song_id: string;
  position: number;
  added_at: string;
  song: Song;
}

export interface HistoryEntry {
  user_id: string;
  song_id: string;
  viewed_at: string;
  song: Song;
}
