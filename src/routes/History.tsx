import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Music2 } from "lucide-react";
import { CoverPlaceholder } from "../components/catalog/CoverPlaceholder";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { useAuth } from "../context/AuthContext";
import { listHistory } from "../lib/library";
import type { HistoryEntry } from "../types/library";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export function HistoryPage() {
  const { profile } = useAuth();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    listHistory(profile.id)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [profile]);

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-ink sm:text-3xl">Historique</h1>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState icon={Clock} title="Aucune consultation récente" description="Les chansons que tu ouvres apparaîtront ici." />
      ) : (
        <div className="max-w-xl space-y-2">
          {entries.map((entry) => (
            <Link
              key={entry.song_id}
              to={`/songs/${entry.song_id}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised px-3 py-2 hover:border-accent/50"
            >
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                <CoverPlaceholder icon={Music2} imageUrl={entry.song.cover_url || undefined} alt={entry.song.title} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{entry.song.title}</p>
                <p className="truncate text-xs text-muted">{entry.song.artist?.name ?? "Artiste inconnu"}</p>
              </div>
              <span className="shrink-0 text-xs text-muted">{formatDate(entry.viewed_at)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
