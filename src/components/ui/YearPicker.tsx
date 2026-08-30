import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface YearPickerProps {
  id?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  className?: string;
}

export function YearPicker({ id, value, onChange, className }: YearPickerProps) {
  const { t } = useTranslation("admin");
  const [open, setOpen] = useState(false);
  const [decadeStart, setDecadeStart] = useState(() => Math.floor((value ?? new Date().getFullYear()) / 10) * 10);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) setDecadeStart(Math.floor(value / 10) * 10);
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

  const years = Array.from({ length: 12 }, (_, i) => decadeStart - 1 + i);

  function handleSelectYear(year: number) {
    onChange(year);
    setOpen(false);
  }

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
        <span className={clsx(!value && "text-muted")}>{value ?? t("songForm.pickYear")}</span>
        <CalendarDays size={15} className="shrink-0 text-muted" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-56 rounded-xl border border-border bg-surface p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setDecadeStart((d) => d - 10)}
              className="rounded-lg border border-border p-1.5 text-ink hover:border-accent"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="font-serif text-sm font-semibold text-ink">
              {decadeStart} – {decadeStart + 9}
            </span>
            <button
              type="button"
              onClick={() => setDecadeStart((d) => d + 10)}
              className="rounded-lg border border-border p-1.5 text-ink hover:border-accent"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {years.map((year) => {
              const inDecade = year >= decadeStart && year < decadeStart + 10;
              const isSelected = value === year;
              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleSelectYear(year)}
                  className={clsx(
                    "rounded-lg py-1.5 text-xs transition-colors",
                    isSelected
                      ? "bg-accent font-bold text-[#2A0F1E]"
                      : "text-ink hover:bg-surface-raised",
                    !inDecade && "opacity-35"
                  )}
                >
                  {year}
                </button>
              );
            })}
          </div>

          {value && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="mt-2 w-full rounded-lg border border-border py-1.5 text-xs text-muted hover:text-ink"
            >
              {t("songForm.clearYear")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
