import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarDays, MapPin, Plus } from "lucide-react";
import { MonthCalendar } from "../../components/events/MonthCalendar";
import { EventForm } from "../../components/events/EventForm";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { createEvent, listEvents, type EventInput } from "../../lib/events";
import { type AppEvent } from "../../types/events";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const LOCALE_MAP: Record<string, string> = { fr: "fr-FR", en: "en-US" };

export function CalendarPage() {
  const { t, i18n } = useTranslation("calendar");
  const locale = LOCALE_MAP[i18n.language] ?? "fr-FR";
  const DATE_FMT = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }), [locale]);
  const TIME_FMT = useMemo(() => new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }), [locale]);
  useDocumentTitle(t("calendar.title"));
  const { profile } = useAuth();
  const canManageEvents = profile?.role === "admin" || profile?.role === "chef_choeur";
  const { showToast } = useToast();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    listEvents()
      .then(setEvents)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const upcoming = useMemo(() => {
    const now = new Date();
    return events.filter((e) => new Date(e.event_date) >= now).slice(0, 5);
  }, [events]);

  const dayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((e) => sameDay(new Date(e.event_date), selectedDate));
  }, [events, selectedDate]);

  async function handleCreate(input: EventInput) {
    try {
      const created = await createEvent(input);
      setEvents((prev) => [...prev, created]);
      setShowForm(false);
      showToast(t("calendar.toast.createSuccess"), "success");
    } catch {
      showToast(t("calendar.toast.createError"), "error");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{t("calendar.title")}</h1>
        {canManageEvents && (
          <Button onClick={() => setShowForm(true)}>
            <Plus size={15} />
            {t("calendar.newEvent")}
          </Button>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <MonthCalendar
            month={month}
            events={events}
            selectedDate={selectedDate}
            onSelectDay={setSelectedDate}
            onChangeMonth={(dir) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + dir, 1))}
          />

          <div className="space-y-4">
            <div>
              <h2 className="mb-2 font-serif text-base font-semibold text-ink">
                {selectedDate ? DATE_FMT.format(selectedDate) : t("calendar.upcomingEvents")}
              </h2>
              {(selectedDate ? dayEvents : upcoming).length === 0 ? (
                <EmptyState icon={CalendarDays} title={t("calendar.noEvents")} />
              ) : (
                <div className="space-y-2">
                  {(selectedDate ? dayEvents : upcoming).map((e) => (
                    <Link key={e.id} to={`/events/${e.id}`}>
                      <Card className="p-3 hover:border-accent/40">
                        <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-accent-ink">{t(`eventTypes.${e.type}`)}</p>
                        <p className="truncate font-semibold text-ink">{e.name}</p>
                        <p className="text-xs text-muted">
                          {DATE_FMT.format(new Date(e.event_date))} · {TIME_FMT.format(new Date(e.event_date))}
                        </p>
                        {e.location && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                            <MapPin size={12} /> {e.location}
                          </p>
                        )}
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={t("calendar.newEvent")}>
        <EventForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
