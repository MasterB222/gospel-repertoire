import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { getSong } from "../../lib/catalog";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { Music2 } from "lucide-react";
import type { Song } from "../../types/catalog";

export function PresentMode() {
  const { id } = useParams<{ id: string }>();
  const [song, setSong] = useState<Song | null | undefined>(undefined);
  const [sectionIdx, setSectionIdx] = useState(0);

  useEffect(() => {
    if (!id) return;
    getSong(id).then(setSong).catch(() => setSong(null));
  }, [id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") setSectionIdx((i) => i + 1);
      if (e.key === "ArrowLeft") setSectionIdx((i) => Math.max(0, i - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sections = (song?.structure ?? []).filter((s) => !s.hidden).sort((a, b) => a.order - b.order);
  const section = sections[Math.min(sectionIdx, sections.length - 1)];
  const lyrics = section?.measures.map((m) => m.lyrics).filter(Boolean).join("\n") || song?.lyrics;

  if (song === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Skeleton className="h-40 w-full max-w-md" />
      </div>
    );
  }

  if (song === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6">
        <EmptyState icon={Music2} title="Chanson introuvable" />
        <Link to="/songs" className="text-sm text-accent hover:underline">
          Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-ink">
      <div className="flex items-center justify-between px-6 py-4">
        <p className="text-sm text-muted">{section?.name ?? song.title}</p>
        <Link to={`/songs/${id}`} className="rounded-full p-2 text-muted hover:bg-surface-raised hover:text-ink">
          <X size={22} />
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 sm:px-16">
        <p className="whitespace-pre-line text-center font-serif text-4xl font-semibold leading-snug sm:text-6xl">
          {lyrics || "—"}
        </p>
      </div>

      {sections.length > 1 && (
        <div className="flex items-center justify-center gap-6 pb-10">
          <button
            onClick={() => setSectionIdx((i) => Math.max(0, i - 1))}
            disabled={sectionIdx === 0}
            className="rounded-full border border-border p-3 text-ink hover:border-accent disabled:opacity-30"
            aria-label="Section précédente"
          >
            <ChevronLeft size={22} />
          </button>
          <span className="text-sm text-muted">
            {sectionIdx + 1} / {sections.length}
          </span>
          <button
            onClick={() => setSectionIdx((i) => Math.min(sections.length - 1, i + 1))}
            disabled={sectionIdx === sections.length - 1}
            className="rounded-full border border-border p-3 text-ink hover:border-accent disabled:opacity-30"
            aria-label="Section suivante"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </div>
  );
}
