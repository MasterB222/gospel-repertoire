import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Music2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import { deleteSong, listAllSongs } from "../../lib/admin";
import type { Song } from "../../types/catalog";

export function AdminSongsList() {
  const { t } = useTranslation("admin");
  const { showToast } = useToast();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  function load() {
    setLoading(true);
    listAllSongs()
      .then(setSongs)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(t("songs.deleteConfirm", { title }))) return;
    try {
      await deleteSong(id);
      setSongs((prev) => prev.filter((s) => s.id !== id));
      showToast(t("songs.deleteSuccess"), "success");
    } catch {
      showToast(t("songs.deleteFailed"), "error");
    }
  }

  const filtered = songs.filter((s) => s.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{t("songs.title")}</h1>
        <Link to="/admin/songs/create">
          <Button>
            <Plus size={15} />
            {t("songs.new")}
          </Button>
        </Link>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("songs.searchPlaceholder")}
        className="mb-4 w-full max-w-sm rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Music2} title={t("songs.empty")} />
      ) : (
        <div className="max-w-3xl space-y-2">
          {filtered.map((song) => (
            <div key={song.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-raised px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{song.title}</p>
                <p className="truncate text-xs text-muted">{song.artist?.name ?? t("songs.unknownArtist")}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    song.status === "publie" ? "bg-emerald-500/15 text-emerald-400" : "bg-orange-500/15 text-orange-400"
                  }`}
                >
                  {song.status === "publie" ? t("songs.published") : t("songs.draft")}
                </span>
                <Link to={`/admin/songs/${song.id}/edit`} className="rounded-lg p-1.5 text-muted hover:text-ink">
                  <Pencil size={15} />
                </Link>
                <button onClick={() => handleDelete(song.id, song.title)} className="rounded-lg p-1.5 text-muted hover:text-danger">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
