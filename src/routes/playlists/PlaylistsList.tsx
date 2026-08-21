import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ListMusic, Plus, Trash2 } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { createPlaylist, deletePlaylist, listPlaylists } from "../../lib/library";
import type { Playlist } from "../../types/library";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export function PlaylistsList() {
  useDocumentTitle("Playlists");
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  function load() {
    if (!profile) return;
    setLoading(true);
    listPlaylists(profile.id)
      .then(setPlaylists)
      .finally(() => setLoading(false));
  }

  useEffect(load, [profile]);

  async function handleCreate() {
    if (!profile || !name.trim()) return;
    try {
      const playlist = await createPlaylist(profile.id, name.trim(), "");
      setPlaylists((prev) => [playlist, ...prev]);
      setName("");
    } catch {
      showToast("Échec de la création de la playlist.", "error");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletePlaylist(id);
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
    } catch {
      showToast("Échec de la suppression.", "error");
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-ink sm:text-3xl">Playlists</h1>

      <div className="mb-6 flex max-w-md gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Nom de la nouvelle playlist..."
          className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
        <Button onClick={handleCreate}>
          <Plus size={15} />
          Créer
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <EmptyState icon={ListMusic} title="Aucune playlist pour l'instant" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((p) => (
            <Card key={p.id} className="flex items-center justify-between p-4">
              <Link to={`/playlists/${p.id}`} className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{p.name}</p>
                <p className="text-xs text-muted">Ouvrir</p>
              </Link>
              <button onClick={() => handleDelete(p.id)} className="ml-2 shrink-0 rounded-lg p-1.5 text-muted hover:text-danger">
                <Trash2 size={15} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
