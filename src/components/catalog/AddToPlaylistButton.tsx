import { useEffect, useState } from "react";
import { ListPlus, Check, Plus } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  addSongToPlaylist,
  createPlaylist,
  listPlaylists,
  listPlaylistSongs,
  removeSongFromPlaylist,
} from "../../lib/library";
import type { Playlist } from "../../types/library";

export function AddToPlaylistButton({ songId }: { songId: string }) {
  const { isAuthenticated, profile } = useAuth();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [containing, setContaining] = useState<Set<string>>(new Set());
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!open || !profile) return;
    listPlaylists(profile.id).then(async (pls) => {
      setPlaylists(pls);
      const results = await Promise.all(
        pls.map(async (p) => ({ id: p.id, has: (await listPlaylistSongs(p.id)).some((s) => s.song_id === songId) }))
      );
      setContaining(new Set(results.filter((r) => r.has).map((r) => r.id)));
    });
  }, [open, profile, songId]);

  if (!isAuthenticated) return null;

  async function toggle(playlistId: string) {
    const has = containing.has(playlistId);
    try {
      if (has) await removeSongFromPlaylist(playlistId, songId);
      else await addSongToPlaylist(playlistId, songId);
      setContaining((prev) => {
        const next = new Set(prev);
        has ? next.delete(playlistId) : next.add(playlistId);
        return next;
      });
    } catch {
      showToast("Échec de la mise à jour de la playlist.", "error");
    }
  }

  async function handleCreate() {
    if (!profile || !newName.trim()) return;
    try {
      const playlist = await createPlaylist(profile.id, newName.trim(), "");
      await addSongToPlaylist(playlist.id, songId);
      setPlaylists((prev) => [playlist, ...prev]);
      setContaining((prev) => new Set(prev).add(playlist.id));
      setNewName("");
    } catch {
      showToast("Échec de la création de la playlist.", "error");
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-ink hover:border-accent"
      >
        <ListPlus size={15} />
        Ajouter à une playlist
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Ajouter à une playlist">
        <div className="space-y-3">
          {playlists.length === 0 && <p className="text-sm text-muted">Aucune playlist pour l'instant.</p>}
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {playlists.map((p) => (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface-raised"
              >
                {p.name}
                {containing.has(p.id) && <Check size={15} className="text-accent-ink" />}
              </button>
            ))}
          </div>
          <div className="flex gap-2 border-t border-border pt-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nouvelle playlist..."
              className="flex-1 rounded-lg border border-border bg-surface-raised px-2.5 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
            <Button onClick={handleCreate} className="!px-3">
              <Plus size={15} />
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
