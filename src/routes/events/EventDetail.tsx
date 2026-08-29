import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CheckCircle2, Circle, CircleDashed, MapPin, Plus, Trash2, Music2 } from "lucide-react";
import clsx from "clsx";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { listSongs } from "../../lib/catalog";
import { searchProfiles } from "../../lib/collaboration";
import {
  addChecklistItem,
  addSongToProgram,
  deleteChecklistItem,
  deleteEvent,
  getEvent,
  listChecklist,
  listEventProgram,
  removeSongFromProgram,
  updateChecklistItemStatus,
  updateEvent,
} from "../../lib/events";
import { type AppEvent, type ChecklistItem, type ChecklistStatus, type EventProgramItem } from "../../types/events";
import type { Song } from "../../types/catalog";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

const fieldClasses =
  "w-full rounded-lg border border-border bg-surface-raised px-2.5 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const LOCALE_MAP: Record<string, string> = { fr: "fr-FR", en: "en-US" };

const CHECKLIST_ORDER: ChecklistStatus[] = ["a_faire", "en_cours", "fait"];
const CHECKLIST_ICON: Record<ChecklistStatus, typeof Circle> = { a_faire: Circle, en_cours: CircleDashed, fait: CheckCircle2 };

function nextStatus(status: ChecklistStatus): ChecklistStatus {
  const idx = CHECKLIST_ORDER.indexOf(status);
  return CHECKLIST_ORDER[(idx + 1) % CHECKLIST_ORDER.length];
}

export function EventDetail() {
  const { t, i18n } = useTranslation("calendar");
  const DATE_FMT = new Intl.DateTimeFormat(LOCALE_MAP[i18n.language] ?? "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { showToast } = useToast();
  useDocumentTitle(t("eventDetail.documentTitle"));
  const canManage = profile?.role === "admin" || profile?.role === "chef_choeur";

  const [event, setEvent] = useState<AppEvent | null>(null);
  const [program, setProgram] = useState<EventProgramItem[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const [songQuery, setSongQuery] = useState("");
  const [newItem, setNewItem] = useState("");
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const [assigneeResults, setAssigneeResults] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);

  function load() {
    if (!id) return;
    setLoading(true);
    Promise.all([getEvent(id), listEventProgram(id), listChecklist(id), listSongs()])
      .then(([ev, prog, check, songs]) => {
        setEvent(ev);
        setProgram(prog);
        setChecklist(check);
        setAllSongs(songs);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  useEffect(() => {
    if (!assigneeQuery.trim()) {
      setAssigneeResults([]);
      return;
    }
    const timer = window.setTimeout(() => {
      searchProfiles(assigneeQuery).then(setAssigneeResults);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [assigneeQuery]);

  const songResults = songQuery.trim()
    ? allSongs.filter((s) => s.title.toLowerCase().includes(songQuery.toLowerCase()) && !program.some((p) => p.song_id === s.id)).slice(0, 8)
    : [];

  async function handleAddSong(song: Song) {
    if (!id) return;
    try {
      await addSongToProgram(id, song.id, program.length);
      setProgram((prev) => [...prev, { id: crypto.randomUUID(), event_id: id, song_id: song.id, position: prev.length, key_signature: "", stage_notes: "", song: { id: song.id, title: song.title, original_key: song.original_key } }]);
      setSongQuery("");
    } catch {
      showToast(t("eventDetail.toast.addSongError"), "error");
    }
  }

  async function handleRemoveSong(programItemId: string) {
    try {
      await removeSongFromProgram(programItemId);
      setProgram((prev) => prev.filter((p) => p.id !== programItemId));
    } catch {
      showToast(t("eventDetail.toast.removeError"), "error");
    }
  }

  async function handleAddChecklistItem() {
    if (!id || !newItem.trim()) return;
    try {
      await addChecklistItem(id, newItem.trim(), assigneeId);
      setNewItem("");
      setAssigneeQuery("");
      setAssigneeId(null);
      load();
    } catch {
      showToast(t("eventDetail.toast.addChecklistError"), "error");
    }
  }

  async function handleCycleStatus(item: ChecklistItem) {
    const status = nextStatus(item.status);
    setChecklist((prev) => prev.map((c) => (c.id === item.id ? { ...c, status } : c)));
    try {
      await updateChecklistItemStatus(item.id, status);
    } catch {
      showToast(t("eventDetail.toast.updateError"), "error");
    }
  }

  async function handleDeleteChecklistItem(itemId: string) {
    try {
      await deleteChecklistItem(itemId);
      setChecklist((prev) => prev.filter((c) => c.id !== itemId));
    } catch {
      showToast(t("eventDetail.toast.removeError"), "error");
    }
  }

  async function handleDeleteEvent() {
    if (!id || !window.confirm(t("eventDetail.deleteConfirm"))) return;
    try {
      await deleteEvent(id);
      navigate("/calendar");
    } catch {
      showToast(t("eventDetail.toast.removeError"), "error");
    }
  }

  async function handleStatusChange(status: AppEvent["status"]) {
    if (!id) return;
    setEvent((prev) => (prev ? { ...prev, status } : prev));
    try {
      await updateEvent(id, { status });
    } catch {
      showToast(t("eventDetail.toast.statusUpdateError"), "error");
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!event) {
    return <EmptyState icon={Music2} title={t("eventDetail.notFound")} />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => navigate("/calendar")} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} />
        {t("eventDetail.back")}
      </button>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent-ink">{t(`eventTypes.${event.type}`)}</p>
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{event.name}</h1>
        <p className="mt-1 text-sm capitalize text-muted">{DATE_FMT.format(new Date(event.event_date))}</p>
        {event.location && (
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <MapPin size={14} /> {event.location}
          </p>
        )}
        {event.description && <p className="mt-3 text-sm text-ink">{event.description}</p>}

        {canManage && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={event.status}
              onChange={(e) => handleStatusChange(e.target.value as AppEvent["status"])}
              className="rounded-lg border border-border bg-surface-raised px-2 py-1 text-xs font-semibold text-ink focus:border-accent focus:outline-none"
            >
              <option value="brouillon">{t("eventDetail.statusOptions.brouillon")}</option>
              <option value="publie">{t("eventDetail.statusOptions.publie")}</option>
              <option value="termine">{t("eventDetail.statusOptions.termine")}</option>
              <option value="annule">{t("eventDetail.statusOptions.annule")}</option>
            </select>
            <button onClick={handleDeleteEvent} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs text-danger hover:border-danger">
              <Trash2 size={13} />
              {t("eventDetail.deleteEvent")}
            </button>
          </div>
        )}
      </div>

      <Card className="p-4">
        <h2 className="mb-3 font-serif text-lg font-semibold text-ink">{t("eventDetail.program.title")}</h2>
        {canManage && (
          <div className="relative mb-3">
            <input
              value={songQuery}
              onChange={(e) => setSongQuery(e.target.value)}
              placeholder={t("eventDetail.program.addPlaceholder")}
              className={fieldClasses}
            />
            {songResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full space-y-0.5 rounded-lg border border-border bg-surface p-1 shadow-lg">
                {songResults.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleAddSong(s)}
                    className="block w-full rounded px-2 py-1.5 text-left text-sm text-ink hover:bg-surface-raised"
                  >
                    {s.title} <span className="text-xs text-muted">· {s.original_key}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {program.length === 0 ? (
          <p className="text-sm text-muted">{t("eventDetail.program.empty")}</p>
        ) : (
          <ol className="space-y-1.5">
            {program.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg bg-surface-raised px-3 py-2 text-sm">
                <span className="min-w-0 truncate">
                  <span className="mr-2 text-xs text-muted">#{i + 1}</span>
                  <span className="font-semibold text-ink">{p.song?.title}</span>
                  {p.song?.original_key && <span className="ml-2 text-xs text-muted">{p.song.original_key}</span>}
                </span>
                {canManage && (
                  <button onClick={() => handleRemoveSong(p.id)} className="shrink-0 text-muted hover:text-danger">
                    <Trash2 size={14} />
                  </button>
                )}
              </li>
            ))}
          </ol>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 font-serif text-lg font-semibold text-ink">{t("eventDetail.checklist.title")}</h2>
        {canManage && (
          <div className="mb-3 space-y-2">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={t("eventDetail.checklist.newItemPlaceholder")}
              className={fieldClasses}
            />
            <div className="relative">
              <input
                value={assigneeQuery}
                onChange={(e) => {
                  setAssigneeQuery(e.target.value);
                  setAssigneeId(null);
                }}
                placeholder={t("eventDetail.checklist.assigneePlaceholder")}
                className={fieldClasses}
              />
              {assigneeResults.length > 0 && !assigneeId && (
                <div className="absolute z-10 mt-1 w-full space-y-0.5 rounded-lg border border-border bg-surface p-1 shadow-lg">
                  {assigneeResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setAssigneeId(u.id);
                        setAssigneeQuery(`${u.first_name} ${u.last_name}`);
                        setAssigneeResults([]);
                      }}
                      className="block w-full rounded px-2 py-1 text-left text-xs text-ink hover:bg-surface-raised"
                    >
                      {u.first_name} {u.last_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={handleAddChecklistItem}>
              <Plus size={15} />
              {t("eventDetail.checklist.add")}
            </Button>
          </div>
        )}

        {checklist.length === 0 ? (
          <p className="text-sm text-muted">{t("eventDetail.checklist.empty")}</p>
        ) : (
          <ul className="space-y-1.5">
            {checklist.map((item) => {
              const Icon = CHECKLIST_ICON[item.status];
              return (
                <li key={item.id} className="flex items-center justify-between gap-2 rounded-lg bg-surface-raised px-3 py-2 text-sm">
                  <button onClick={() => handleCycleStatus(item)} className="flex min-w-0 items-center gap-2 text-left">
                    <Icon size={16} className={clsx(item.status === "fait" ? "text-accent-ink" : "text-muted")} />
                    <span className={clsx("truncate", item.status === "fait" && "text-muted line-through")}>{item.item}</span>
                  </button>
                  <span className="flex shrink-0 items-center gap-2">
                    {item.assignee && <span className="text-xs text-muted">{item.assignee.first_name}</span>}
                    <span className="text-xs text-muted">{t(`checklistStatuses.${item.status}`)}</span>
                    {canManage && (
                      <button onClick={() => handleDeleteChecklistItem(item.id)} className="text-muted hover:text-danger">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
