import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { getSong } from "../../lib/catalog";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { Music2 } from "lucide-react";
import type { Song } from "../../types/catalog";

export function RehearseMode() {
  const { id } = useParams<{ id: string }>();
  const [song, setSong] = useState<Song | null | undefined>(undefined);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [measureIdx, setMeasureIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!id) return;
    getSong(id).then(setSong).catch(() => setSong(null));
  }, [id]);

  const sections = (song?.structure ?? []).filter((s) => !s.hidden).sort((a, b) => a.order - b.order);
  const section = sections[sectionIdx];
  const measure = section?.measures[measureIdx];

  function goNext() {
    if (!section) return;
    if (measureIdx < section.measures.length - 1) {
      setMeasureIdx((i) => i + 1);
    } else if (sectionIdx < sections.length - 1) {
      setSectionIdx((i) => i + 1);
      setMeasureIdx(0);
    }
  }

  function goPrev() {
    if (measureIdx > 0) {
      setMeasureIdx((i) => i - 1);
    } else if (sectionIdx > 0) {
      const prevSection = sections[sectionIdx - 1];
      setSectionIdx((i) => i - 1);
      setMeasureIdx(prevSection.measures.length - 1);
    }
  }

  function repeatSection() {
    setMeasureIdx(0);
    setAutoPlay(false);
  }

  useEffect(() => {
    if (!autoPlay) {
      if (timer.current) window.clearInterval(timer.current);
      return;
    }
    timer.current = window.setInterval(goNext, 3000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, sectionIdx, measureIdx, sections.length]);

  if (song === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Skeleton className="h-40 w-full max-w-md" />
      </div>
    );
  }

  if (song === null || sections.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6">
        <EmptyState icon={Music2} title="Rien à répéter" description="Cette chanson n'a pas encore de structure." />
        <Link to={id ? `/songs/${id}` : "/songs"} className="text-sm text-accent-ink hover:underline">
          Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-ink">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Mode Répétition</p>
          <p className="font-serif text-lg font-semibold">{song.title}</p>
        </div>
        <Link to={`/songs/${id}`} className="rounded-full p-2 text-muted hover:bg-surface-raised hover:text-ink">
          <X size={20} />
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-ink">{section.name}</p>
        <p className="text-xs text-muted">
          Mesure {measure?.number} / {section.measures.length}
        </p>

        {measure?.chord && <p className="font-serif text-3xl font-bold text-accent-ink">{measure.chord}</p>}
        <p className="max-w-2xl text-2xl leading-relaxed sm:text-3xl">{measure?.lyrics || "—"}</p>
        {measure?.notes && <p className="text-muted">{measure.notes}</p>}

        {measure && measure.annotations.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {measure.annotations.map((a) => (
              <span key={a.id} className="rounded-full bg-accent/15 px-3 py-1 text-xs text-accent-ink">
                {a.marker ? `${a.marker} — ` : ""}
                {a.text}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 pb-8 pt-4">
        <button onClick={goPrev} className="rounded-full border border-border p-3 text-ink hover:border-accent" aria-label="Précédent">
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setAutoPlay((a) => !a)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-[#2A0F1E] hover:bg-accent-soft"
          aria-label={autoPlay ? "Pause" : "Lecture automatique"}
        >
          {autoPlay ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
        </button>
        <button onClick={goNext} className="rounded-full border border-border p-3 text-ink hover:border-accent" aria-label="Suivant">
          <ChevronRight size={20} />
        </button>
        <button onClick={repeatSection} className="rounded-full border border-border p-3 text-ink hover:border-accent" aria-label="Répéter la section">
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}
