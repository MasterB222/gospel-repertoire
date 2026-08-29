import { useTranslation } from "react-i18next";

export function BarChart({ title, data }: { title: string; data: { name: string; count: number }[] }) {
  const { t } = useTranslation("admin");
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-muted">{title}</h3>
      {data.length === 0 ? (
        <p className="text-xs text-muted">{t("dashboard.charts.noData")}</p>
      ) : (
        <div className="space-y-2">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="w-28 shrink-0 truncate text-xs text-muted">{d.name}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-raised">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${(d.count / max) * 100}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs text-ink">{d.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
