import { useTranslation } from "react-i18next";
import { STATUS_META, type AssignmentStatus } from "../../types/collaboration";

const ORDER: AssignmentStatus[] = ["a_faire", "en_cours", "termine", "a_revoir"];

export function StatusBadge({
  status,
  onChange,
}: {
  status: AssignmentStatus;
  onChange?: (status: AssignmentStatus) => void;
}) {
  const { t } = useTranslation("editor");
  const meta = STATUS_META[status];

  if (!onChange) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${meta.color}`}>
        {meta.emoji} {t(`status.${status}`)}
      </span>
    );
  }

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as AssignmentStatus)}
      className="rounded-lg border border-border bg-surface-raised px-2 py-1 text-xs font-semibold text-ink focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {ORDER.map((s) => (
        <option key={s} value={s}>
          {STATUS_META[s].emoji} {t(`status.${s}`)}
        </option>
      ))}
    </select>
  );
}
