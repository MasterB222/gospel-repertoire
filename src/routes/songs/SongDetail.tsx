import { useEffect, useRef, useState } from "react";
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
  Play,
  Video,
  Repeat,
  Presentation,
  Download,
  Maximize2,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { CoverPlaceholder } from "../../components/catalog/CoverPlaceholder";
import { FavoriteButton } from "../../components/catalog/FavoriteButton";
import { AddToPlaylistButton } from "../../components/catalog/AddToPlaylistButton";
import { usePlayer } from "../../context/PlayerContext";
import { extractYouTubeId } from "../../lib/youtube";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { AssignmentCard } from "../../components/collaboration/AssignmentCard";
import { AssignmentForm } from "../../components/collaboration/AssignmentForm";
import { CommentThread } from "../../components/collaboration/CommentThread";
import { getSong } from "../../lib/catalog";
import { recordHistory } from "../../lib/library";
import {
  addComment,
  createAssignment,
  listAssignmentsForSong,
  listCommentsForSong,
  updateAssignmentStatus,
} from "../../lib/collaboration";
import type { Song } from "../../types/catalog";
import type { Assignment, AssignmentStatus, Comment } from "../../types/collaboration";
import { Music2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { formatChordDisplay } from "../../lib/music";
import { NashvilleNumber } from "../../components/editor/MeasureCard";
import type { NoteNotation } from "../../types/editor";

type TabKey = "presentation" | "lyrics" | "chords" | "sheet" | "structure" | "learning" | "assignments" | "history";

const NOTATION_OPTIONS: { value: NoteNotation; label: string }[] = [
  { value: "letters", label: "C D E" },
  { value: "solfege", label: "do ré mi" },
  { value: "nashville", label: "1 2 3" },
];

function getTabs(t: TFunction): { key: TabKey; label: string; icon: LucideIcon }[] {
  return [
    { key: "presentation", label: t("detail.tabs.presentation"), icon: Info },
    { key: "lyrics", label: t("detail.tabs.lyrics"), icon: AlignLeft },
    { key: "chords", label: t("detail.tabs.chords"), icon: Guitar },
    { key: "structure", label: t("detail.tabs.structure"), icon: ListTree },
    { key: "assignments", label: t("detail.tabs.assignments"), icon: Users },
    { key: "history", label: t("detail.tabs.history"), icon: History },
    { key: "sheet", label: t("detail.tabs.sheet"), icon: FileMusic },
    { key: "learning", label: t("detail.tabs.learning"), icon: GraduationCap },
  ];
}

function AssignmentsPanel({ song }: { song: Song }) {
  const { t } = useTranslation("songs");
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const isChef = profile?.role === "chef_choeur" || profile?.role === "admin";

  function load() {
    setLoading(true);
    Promise.all([listAssignmentsForSong(song.id), listCommentsForSong(song.id)])
      .then(([a, c]) => {
        setAssignments(a);
        setComments(c);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [song.id]);

  async function handleStatusChange(id: string, status: AssignmentStatus) {
    try {
      await updateAssignmentStatus(id, status);
      setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch {
      showToast(t("detail.assignmentsPanel.statusUpdateError"), "error");
    }
  }

  async function handleCreate(input: {
    section_id: string | null;
    measure_number: number | null;
    assignee_group_id: string | null;
    assignee_user_id: string | null;
    part: string;
  }) {
    if (!profile) return;
    try {
      await createAssignment({ ...input, song_id: song.id, created_by: profile.id });
      showToast(t("detail.assignmentsPanel.createSuccess"), "success");
      load();
    } catch {
      showToast(t("detail.assignmentsPanel.createError"), "error");
    }
  }

  async function handleAddComment(text: string) {
    if (!profile) return;
    try {
      await addComment({ song_id: song.id, section_id: null, measure_number: null, author_id: profile.id, text });
      load();
    } catch {
      showToast(t("detail.assignmentsPanel.commentError"), "error");
    }
  }

  if (loading) return <Skeleton className="h-40 w-full max-w-2xl" />;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="mb-2 font-serif text-base font-semibold text-ink">{t("detail.assignmentsPanel.title")}</h3>
        {assignments.length === 0 ? (
          <p className="text-sm text-muted">{t("detail.assignmentsPanel.empty")}</p>
        ) : (
          <div className="space-y-2">
            {assignments.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                canEditStatus={isChef || a.assignee_user_id === profile?.id}
                onStatusChange={(status) => handleStatusChange(a.id, status)}
              />
            ))}
          </div>
        )}
        {isChef && (
          <div className="mt-3">
            <AssignmentForm sections={song.structure} onSubmit={handleCreate} />
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-2 font-serif text-base font-semibold text-ink">{t("detail.assignmentsPanel.commentsTitle")}</h3>
        <CommentThread comments={comments} onAdd={handleAddComment} />
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export function SongDetail() {
  const { t } = useTranslation("songs");
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, profile } = useAuth();
  const { playSong } = usePlayer();
  const [song, setSong] = useState<Song | null | undefined>(undefined);
  useDocumentTitle(song?.title);
  const [tab, setTab] = useState<TabKey>("presentation");
  const [showVideo, setShowVideo] = useState(false);
  const [structureNotation, setStructureNotation] = useState<NoteNotation>("letters");
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    setSong(undefined);
    getSong(id)
      .then(setSong)
      .catch(() => setSong(null));
  }, [id]);

  useEffect(() => {
    if (!id || !profile) return;
    recordHistory(profile.id, id).catch(() => {});
  }, [id, profile]);

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
        title={t("detail.notFound.title")}
        description={t("detail.notFound.description")}
        action={
          <Link to="/songs" className="text-sm font-semibold text-accent-ink hover:underline">
            {t("detail.backToRepertoire")}
          </Link>
        }
      />
    );
  }

  const visibleSections = song.structure.filter((s) => !s.hidden).sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/songs" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={16} strokeWidth={1.8} />
          {t("detail.backToRepertoire")}
        </Link>
        {isAuthenticated && (
          <Link
            to={`/songs/${song.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-[#2A0F1E] hover:bg-accent-soft"
          >
            <Pencil size={13} />
            {t("detail.edit")}
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="h-48 w-48 shrink-0 overflow-hidden rounded-2xl border border-border md:h-56 md:w-56">
          <CoverPlaceholder icon={Music2} imageUrl={song.cover_url || undefined} alt={song.title} />
        </div>

        <div className="flex flex-col justify-end gap-2">
          {song.category && (
            <span className="w-fit rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-ink">
              {song.category.name}
            </span>
          )}
          <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">{song.title}</h1>
          <p className="text-muted">{song.artist?.name ?? t("detail.unknownArtist")}</p>
          <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted">
            {song.original_key && <span>{t("detail.key", { value: song.original_key })}</span>}
            {song.tempo && <span>{t("detail.tempo", { value: song.tempo })}</span>}
            <span>{t("detail.difficulty", { value: song.difficulty })}</span>
            {song.year && <span>{t("detail.year", { value: song.year })}</span>}
            <span>{t("detail.language", { value: song.language })}</span>
            <span>{t("detail.version", { value: song.version })}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => playSong(song)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[#2A0F1E] hover:bg-accent-soft"
            >
              <Play size={15} className="ml-0.5" />
              {t("detail.listen")}
            </button>
            <AddToPlaylistButton songId={song.id} />
            <FavoriteButton
              songId={song.id}
              className="h-10 w-10 border border-border hover:border-accent"
            />
            {song.structure.length > 0 && (
              <>
                <Link
                  to={`/songs/${song.id}/rehearse`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-ink hover:border-accent"
                >
                  <Repeat size={15} />
                  {t("detail.rehearseMode")}
                </Link>
                <Link
                  to={`/songs/${song.id}/present`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-ink hover:border-accent"
                >
                  <Presentation size={15} />
                  {t("detail.presentMode")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-1 overflow-x-auto border-b border-border pb-px">
        {getTabs(t).map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={clsx(
              "flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors",
              tab === tabItem.key
                ? "border-accent font-semibold text-accent-ink"
                : "border-transparent text-muted hover:text-ink"
            )}
          >
            <tabItem.icon size={15} strokeWidth={1.8} />
            {tabItem.label}
          </button>
        ))}
      </div>

      <div className="py-6">
        {tab === "learning" ? (
          <EmptyState
            icon={GraduationCap}
            title={t("detail.learningPanel.title")}
            description={t("detail.learningPanel.description")}
            action={
              <Link to="/dashboard" className="text-sm font-semibold text-accent-ink hover:underline">
                {t("detail.learningPanel.goToDashboard")}
              </Link>
            }
          />
        ) : tab === "presentation" ? (
          <div className="max-w-2xl space-y-4 text-sm text-ink/90">
            {song.album && <p>{t("detail.presentation.album", { value: song.album })}</p>}
            <p>{t("detail.presentation.partOfRepertoire", { title: song.title, category: song.category?.name ?? t("detail.presentation.generalCategory") })}</p>

            {(() => {
              const videoId = song.youtube_url ? extractYouTubeId(song.youtube_url) : null;
              if (!videoId) {
                return <p className="text-muted">{t("detail.presentation.noVideo")}</p>;
              }
              if (!showVideo) {
                return (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-ink hover:border-accent"
                  >
                    <Video size={15} />
                    {t("detail.presentation.watchOnYoutube")}
                  </button>
                );
              }
              return (
                <div className="aspect-video w-full overflow-hidden rounded-xl border border-border">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={t("detail.presentation.videoIframeTitle", { title: song.title })}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              );
            })()}
          </div>
        ) : tab === "lyrics" ? (
          <pre className="max-w-2xl whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">
            {song.lyrics || t("detail.lyricsUnavailable")}
          </pre>
        ) : tab === "chords" ? (
          <pre className="max-w-2xl whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">
            {song.chords || t("detail.chordsUnavailable")}
          </pre>
        ) : tab === "sheet" ? (
          !song.partition_url ? (
            <EmptyState
              icon={FileMusic}
              title={t("detail.sheet.notAvailableTitle")}
              description={t("detail.sheet.notAvailableDescription")}
            />
          ) : (
            <div className="max-w-2xl">
              <div className="mb-3 flex gap-2">
                <button
                  onClick={() => sheetRef.current?.requestFullscreen()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-ink hover:border-accent"
                >
                  <Maximize2 size={15} />
                  {t("detail.sheet.fullscreen")}
                </button>
                <a
                  href={song.partition_url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-ink hover:border-accent"
                >
                  <Download size={15} />
                  {t("detail.sheet.download")}
                </a>
              </div>
              <div ref={sheetRef} className="aspect-[3/4] w-full overflow-hidden rounded-xl border border-border bg-surface-raised">
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(song.partition_url)}&embedded=true`}
                  title={t("detail.sheet.iframeTitle", { title: song.title })}
                  className="h-full w-full"
                />
              </div>
              <p className="mt-2 text-xs text-muted">
                {t("detail.sheet.previewHint")}
              </p>
            </div>
          )
        ) : tab === "assignments" ? (
          <AssignmentsPanel song={song} />
        ) : tab === "structure" ? (
          visibleSections.length === 0 ? (
            <EmptyState
              icon={ListTree}
              title={t("detail.structure.notDefinedTitle")}
              description={t("detail.structure.notDefinedDescription")}
            />
          ) : (
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center rounded-lg border border-border p-0.5 text-xs">
                {NOTATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStructureNotation(opt.value)}
                    className={clsx(
                      "rounded-md px-2.5 py-1 transition-colors",
                      structureNotation === opt.value ? "bg-accent text-[#2A0F1E] font-semibold" : "text-ink hover:bg-surface-raised"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {visibleSections.map((section) => (
                <div key={section.id} className="rounded-xl border border-border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-serif text-base font-semibold text-ink">{section.name}</h3>
                    {section.assigned_to && (
                      <span className="text-xs text-muted">{t("detail.structure.assignedTo", { value: section.assigned_to })}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {section.measures.map((m) => (
                      <div key={m.number} className="rounded-lg bg-surface-raised px-2.5 py-1.5 text-xs">
                        <span className="text-muted">#{m.number}</span>{" "}
                        {m.chord &&
                          (structureNotation === "nashville" ? (
                            <span className="font-semibold text-accent-ink">
                              <NashvilleNumber
                                text={formatChordDisplay(m.chord, structureNotation, song.original_key)}
                                mark={m.nashvilleMark}
                              />
                              {m.chord2 && (
                                <NashvilleNumber
                                  text={formatChordDisplay(m.chord2, structureNotation, song.original_key)}
                                  mark={m.nashvilleMark2}
                                />
                              )}
                            </span>
                          ) : (
                            <span className="font-semibold text-accent-ink">
                              {formatChordDisplay(m.chord, structureNotation, song.original_key)}
                              {m.chord2 && ` · ${formatChordDisplay(m.chord2, structureNotation, song.original_key)}`}
                            </span>
                          ))}{" "}
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
            <EmptyState icon={History} title={t("detail.history.emptyTitle")} description={t("detail.history.emptyDescription")} />
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
