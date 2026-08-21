import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Info,
  AlignLeft,
  Guitar,
  FileMusic,
  ListTree,
  GraduationCap,
  Users,
  History,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import { CoverPlaceholder } from "../../components/catalog/CoverPlaceholder";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { getSong } from "../../lib/catalog";
import type { Song } from "../../types/catalog";
import { Music2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

type TabKey = "presentation" | "lyrics" | "chords" | "sheet" | "structure" | "learning" | "assignments" | "history";

const TABS: { key: TabKey; label: string; icon: LucideIcon; available: boolean; phase?: string }[] = [
  { key: "presentation", label: "Présentation", icon: Info, available: true },
  { key: "lyrics", label: "Paroles", icon: AlignLeft, available: true },
  { key: "chords", label: "Accords", icon: Guitar, available: true },
  { key: "structure", label: "Structure", icon: ListTree, available: true },
  { key: "history", label: "Historique", icon: History, available: true },
  { key: "sheet", label: "Partition", icon: FileMusic, available: false, phase: "Phase 5 — Multimédia" },
  { key: "learning", label: "Apprentissage", icon: GraduationCap, available: false, phase: "Phase 4 — Collaboration" },
  { key: "assignments", label: "Assignations", icon: Users, available: false, phase: "Phase 4 — Collaboration" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export function SongDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [song, setSong] = useState<Song | null | undefined>(undefined);
  const [tab, setTab] = useState<TabKey>("presentation");

  useEffect(() => {
    if (!id) return;
    setSong(undefined);
    getSong(id)
      .then(setSong)
      .catch(() => setSong(null));
  }, [id]);

  if (song === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (song === null) {
    return (
      <EmptyState
        icon={Music2}
        title="Chanson introuvable"
        description="Elle a peut-être été retirée du répertoire."
        action={
          <Link to="/songs" className="text-sm font-semibold text-accent hover:underline">
            Retour au répertoire
          </Link>
        }
      />
    );
  }

  const activeTab = TABS.find((t) => t.key === tab)!;
  const visibleSections = song.structure.filter((s) => !s.hidden).sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/songs" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={16} strokeWidth={1.8} />
          Retour au répertoire
        </Link>
        {isAuthenticated && (
          <Link
            to={`/songs/${song.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-[#2A0F1E] hover:bg-accent-soft"
          >
            <Pencil size={13} />
            Éditer
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="h-48 w-48 shrink-0 overflow-hidden rounded-2xl border border-border md:h-56 md:w-56">
          <CoverPlaceholder icon={Music2} imageUrl={song.cover_url || undefined} alt={song.title} />
        </div>

        <div className="flex flex-col justify-end gap-2">
          {song.category && (
            <span className="w-fit rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
              {song.category.name}
            </span>
          )}
          <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">{song.title}</h1>
          <p className="text-muted">{song.artist?.name ?? "Artiste inconnu"}</p>
          <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted">
            {song.original_key && <span>Tonalité : {song.original_key}</span>}
            {song.tempo && <span>Tempo : {song.tempo} BPM</span>}
            <span>Difficulté : {song.difficulty}</span>
            {song.year && <span>Année : {song.year}</span>}
            <span>Langue : {song.language}</span>
            <span>Version {song.version}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-1 overflow-x-auto border-b border-border pb-px">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              "flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors",
              tab === t.key
                ? "border-accent font-semibold text-accent"
                : "border-transparent text-muted hover:text-ink"
            )}
          >
            <t.icon size={15} strokeWidth={1.8} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="py-6">
        {!activeTab.available ? (
          <EmptyState
            icon={activeTab.icon}
            title={`${activeTab.label} — bientôt disponible`}
            description={`Cet onglet arrivera en ${activeTab.phase}.`}
          />
        ) : tab === "presentation" ? (
          <div className="max-w-2xl space-y-3 text-sm text-ink/90">
            {song.album && <p>Album : {song.album}</p>}
            <p>{song.title} fait partie du répertoire {song.category?.name ?? "général"}.</p>
          </div>
        ) : tab === "lyrics" ? (
          <pre className="max-w-2xl whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">
            {song.lyrics || "Paroles non disponibles pour cette chanson."}
          </pre>
        ) : tab === "chords" ? (
          <pre className="max-w-2xl whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">
            {song.chords || "Accords non disponibles pour cette chanson."}
          </pre>
        ) : tab === "structure" ? (
          visibleSections.length === 0 ? (
            <EmptyState
              icon={ListTree}
              title="Structure non définie"
              description="Ouvre l'éditeur pour créer les sections et mesures de cette chanson."
            />
          ) : (
            <div className="max-w-2xl space-y-4">
              {visibleSections.map((section) => (
                <div key={section.id} className="rounded-xl border border-border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-serif text-base font-semibold text-ink">{section.name}</h3>
                    {section.assigned_to && (
                      <span className="text-xs text-muted">Assigné : {section.assigned_to}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {section.measures.map((m) => (
                      <div key={m.number} className="rounded-lg bg-surface-raised px-2.5 py-1.5 text-xs">
                        <span className="text-muted">#{m.number}</span>{" "}
                        {m.chord && <span className="font-semibold text-accent">{m.chord}</span>}{" "}
                        <span className="text-ink">{m.lyrics}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          song.version_history.length === 0 ? (
            <EmptyState icon={History} title="Aucun historique pour l'instant" description="Les modifications apparaîtront ici après un passage dans l'éditeur." />
          ) : (
            <ul className="max-w-md space-y-2 text-sm">
              {[...song.version_history].reverse().map((entry, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-surface-raised px-3 py-2">
                  <span className="font-semibold text-ink">v{entry.version}</span>
                  <span className="text-muted">{entry.author}</span>
                  <span className="text-xs text-muted">{formatDate(entry.at)}</span>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
}
