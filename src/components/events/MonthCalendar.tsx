import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AppEvent } from "../../types/events";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTH_LABEL = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildGrid(month: Date): Date[] {
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayIndex = (firstOfMonth.getDay() + 6) % 7; // 0 = lundi
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - mondayIndex);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }
  return days;
}

interface MonthCalendarProps {
  month: Date;
  events: AppEvent[];
  selectedDate: Date | null;
  onSelectDay: (date: Date) => void;
  onChangeMonth: (direction: 1 | -1) => void;
}

export function MonthCalendar({ month, events, selectedDate, onSelectDay, onChangeMonth }: MonthCalendarProps) {
  const days = buildGrid(month);
  const today = new Date();

  function eventsOn(day: Date): AppEvent[] {
    return events.filter((e) => sameDay(new Date(e.event_date), day));
  }

  return (
    <div className="rounded-xl border border-border bg-surface-raised p-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold capitalize text-ink">{MONTH_LABEL.format(month)}</h2>
        <div className="flex gap-1">
          <button
            onClick={() => onChangeMonth(-1)}
            aria-label="Mois précédent"
            className="rounded-lg border border-border p-1.5 text-ink hover:border-accent"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onChangeMonth(1)}
            aria-label="Mois suivant"
            className="rounded-lg border border-border p-1.5 text-ink hover:border-accent"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-muted">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayEvents = eventsOn(day);
          const inMonth = day.getMonth() === month.getMonth();
          const isToday = sameDay(day, today);
          const isSelected = selectedDate && sameDay(day, selectedDate);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
              className={clsx(
                "flex h-16 flex-col items-center justify-start gap-1 rounded-lg border p-1 text-xs transition-colors",
                isSelected
                  ? "border-accent bg-accent/15"
                  : "border-transparent hover:border-border hover:bg-surface",
                !inMonth && "opacity-35"
              )}
            >
              <span className={clsx("flex h-5 w-5 items-center justify-center rounded-full", isToday && "bg-accent text-[#2A0F1E] font-bold")}>
                {day.getDate()}
              </span>
              {dayEvents.length > 0 && (
                <span className="flex gap-0.5">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span key={e.id} className="h-1.5 w-1.5 rounded-full bg-accent" />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
