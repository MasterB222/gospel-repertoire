import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

const LOCALE_MAP: Record<string, string> = { fr: "fr-FR", en: "en-US" };

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function parseValue(value: string): { date: Date | null; time: string } {
  if (!value) return { date: null, time: "" };
  const [datePart, timePart] = value.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  if (!y || !m || !d) return { date: null, time: "" };
  return { date: new Date(y, m - 1, d), time: timePart ?? "" };
}

function formatValue(date: Date, time: string): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${time || "09:00"}`;
}

function buildGrid(month: Date): Date[] {
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayIndex = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - mondayIndex);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface DateTimePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function DateTimePicker({ id, value, onChange, className }: DateTimePickerProps) {
  const { t, i18n } = useTranslation("calendar");
  const locale = LOCALE_MAP[i18n.language] ?? "fr-FR";
  const { date: selected, time } = parseValue(value);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => selected ?? new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parsed = parseValue(value).date;
    if (parsed) setViewMonth(parsed);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(viewMonth);
  const weekdays = t("monthCalendar.weekdays", { returnObjects: true }) as string[];
  const days = buildGrid(viewMonth);
  const today = new Date();

  function handleSelectDay(day: Date) {
    onChange(formatValue(day, time));
    setOpen(false);
  }

  function handleTimeChange(newTime: string) {
    onChange(formatValue(selected ?? new Date(), newTime));
  }

  const displayLabel = selected
    ? `${selected.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}${time ? ` · ${time}` : ""}`
    : t("eventForm.pickDateTime");

  return (
    <div className="relative" ref={containerRef}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface-raised px-2.5 py-2 text-left text-sm text-ink focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className
        )}
      >
        <span className={clsx("truncate", !selected && "text-muted")}>{displayLabel}</span>
        <CalendarDays size={15} className="shrink-0 text-muted" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-72 rounded-xl border border-border bg-surface p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              className="rounded-lg border border-border p-1.5 text-ink hover:border-accent"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="font-serif text-sm font-semibold capitalize text-ink">{monthLabel}</span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              className="rounded-lg border border-border p-1.5 text-ink hover:border-accent"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-muted">
            {weekdays.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const inMonth = day.getMonth() === viewMonth.getMonth();
              const isToday = sameDay(day, today);
              const isSelected = selected && sameDay(day, selected);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={clsx(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors",
                    isSelected
                      ? "bg-accent font-bold text-[#2A0F1E]"
                      : isToday
                        ? "border border-accent text-accent-ink"
                        : "text-ink hover:bg-surface-raised",
                    !inMonth && "opacity-35"
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 border-t border-border pt-3">
            <label className="mb-1 block text-xs font-semibold text-muted">{t("eventForm.timeLabel")}</label>
            <input
              type="time"
              value={time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
