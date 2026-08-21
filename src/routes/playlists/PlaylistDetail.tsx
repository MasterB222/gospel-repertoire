import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowUp, ListMusic, Pencil, Play, Plus, Search, Trash2 } from "lucide-react";
import { CoverPlaceholder } from "../../components/catalog/CoverPlaceholder";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { usePlayer } from "../../context/PlayerContext";
import { useToast } from "../../context/ToastContext";
import { listSongs } from "../../lib/catalog";
import {
  addSongToPlaylist,
  deletePlaylist,
  getPlaylist,
  listPlaylistSongs,
  removeSongFromPlaylist,
  renamePlaylist,
  reorderPlaylistSongs,
} from "../../lib/library";
import type { Playlist, PlaylistSong } from "../../types/library";
import type { Song } from "../../types/catalog";
import { Music2 } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playSong } = usePlayer();
  const { showToast } = useToast();
  const [playlist, setPlaylist] = useState<Playlist | null | undefined>(undefined);
  useDocumentTitle(playlist?.name);
  const [songs, setSongs] = useState<PlaylistSong[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [search, setSearch] = useState("");

  function load() {
    if (!id) return;
    Promise.all([getPlaylist(id), listPlaylistSongs(id)]).then(([p, s]) => {
      setPlaylist(p);
      setSongs(s);
      if (p) setDraftName(p.name);
    });
  }

  useEffect(load, [id]);
  useEffect(() => {
    listSongs().then(setAllSongs);
  }, []);

  const addedIds = new Set(songs.map((s) => s.song_id));
  const searchResults =
    search.trim().length === 0
      ? []
      : allSongs
          .filter((s) => !addedIds.has(s.id))
          .filter((s) => `${s.title} ${s.artist?.name ?? ""}`.toLowerCase().includes(search.trim().toLowerCase()))
          .slice(0, 8);

  async function handleAddSong(songId: string) {
    if (!id) return;
    try {
      await addSongToPlaylist(id, songId);
      load();
      setSearch("");
    } catch {
      showToast("Échec de l'ajout de la chanson.", "error");
    }
  }

  async function handleRemove(songId: string) {
    if (!id) return;
    try {
      await removeSongFromPlaylist(id, songId);
      setSongs((prev) => prev.filter((s) => s.song_id !== songId));
    } catch {
      showToast("Échec du retrait.", "error");
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    if (!id) return;
    const next = [...songs];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSongs(next);
    await reorderPlaylistSongs(id, next.map((s) => s.song_id));
  }

  async function handleRename() {
    if (!id || !draftName.trim()) return;
    try {
      await renamePlaylist(id, draftName.trim(), playlist?.description ?? "");
      setPlaylist((p) => (p ? { ...p, name: draftName.trim() } : p));
      setEditingName(false);
    } catch {
      showToast("Échec du renommage.", "error");
    }
  }

  async function handleDelete() {
    if (!id) return;
    try {
      await deletePlaylist(id);
      navigate("/playlists");
    } catch {
      showToast("Échec de la suppression.", "error");
    }
  }

  if (playlist === undefined) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (playlist === null) {
    return (
      <EmptyState
        icon={ListMusic}
        title="Playlist introuvable"
        action={
          <Link to="/playlists" className="text-sm font-semibold text-accent hover:underline">
            Retour aux playlists
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <Link to="/playlists" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} strokeWidth={1.8} />
        Retour aux playlists
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {editingName ? (
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            className="rounded-lg border border-accent bg-surface-raised px-3 py-1.5 font-serif text-2xl text-ink"
          />
        ) : (
          <h1 className="flex items-center gap-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
            {playlist.name}
            <button onClick={() => setEditingName(true)} className="text-muted hover:text-ink">
              <Pencil size={16} />
            </button>
          </h1>
        )}

        <div className="flex gap-2">
          {songs.length > 0 && (
            <Button onClick={() => playSong(songs[0].song, songs.map((s) => s.song))}>
              <Play size={15} className="ml-0.5" />
              Lire tout
            </Button>
          )}
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 size={15} />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="mb-6 max-w-xl">
        <div className="relative">
          <Search size={16} strokeWidth={1.8} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Chercher une chanson à ajouter..."
            className="w-full rounded-xl border border-border bg-surface-raised py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </div>
        {search.trim() && (
          <div className="mt-1.5 space-y-1 rounded-xl border border-border bg-surface p-1.5">
            {searchResults.length === 0 ? (
              <p className="px-2 py-1.5 text-xs text-muted">Aucun résultat.</p>
            ) : (
              searchResults.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleAddSong(s.id)}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm text-ink hover:bg-surface-raised"
                >
                  <span className="min-w-0 truncate">
                    {s.title} <span className="text-muted">— {s.artist?.name ?? "Artiste inconnu"}</span>
                  </span>
                  <Plus size={14} className="shrink-0 text-accent" />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {songs.length === 0 ? (
        <EmptyState
          icon={ListMusic}
          title="Playlist vide"
          description="Cherche une chanson ci-dessus pour l'ajouter."
        />
      ) : (
        <div className="max-w-xl space-y-2">
          {songs.map((item, i) => (
            <div key={item.song_id} className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised px-3 py-2">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                <CoverPlaceholder icon={Music2} imageUrl={item.song.cover_url || undefined} alt={item.song.title} />
              </div>
              <Link to={`/songs/${item.song_id}`} className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{item.song.title}</p>
                <p className="truncate text-xs text-muted">{item.song.artist?.name ?? "Artiste inconnu"}</p>
              </Link>
              <div className="flex shrink-0 items-center gap-0.5">
                <button onClick={() => handleMove(i, -1)} disabled={i === 0} className="rounded p-1 text-muted hover:text-ink disabled:opacity-30">
                  <ArrowUp size={14} />
                </button>
                <button onClick={() => handleMove(i, 1)} disabled={i === songs.length - 1} className="rounded p-1 text-muted hover:text-ink disabled:opacity-30">
                  <ArrowDown size={14} />
                </button>
                <button onClick={() => handleRemove(item.song_id)} className="rounded p-1 text-muted hover:text-danger">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
