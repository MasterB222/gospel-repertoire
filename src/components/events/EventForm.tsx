import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";
import { DateTimePicker } from "../ui/DateTimePicker";
import { EVENT_TYPES, EVENT_STATUSES, type EventStatus, type EventType } from "../../types/events";
import type { EventInput } from "../../lib/events";

const fieldClasses =
  "w-full rounded-lg border border-border bg-surface-raised px-2.5 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const labelClasses = "mb-1 block text-xs font-semibold text-muted";

interface EventFormProps {
  initial?: EventInput;
  onSubmit: (input: EventInput) => Promise<void>;
  onCancel: () => void;
}

function toLocalDatetimeInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventForm({ initial, onSubmit, onCancel }: EventFormProps) {
  const { t } = useTranslation(["calendar", "common"]);
  const uid = useId();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [eventDate, setEventDate] = useState(toLocalDatetimeInput(initial?.event_date));
  const [location, setLocation] = useState(initial?.location ?? "");
  const [type, setType] = useState<EventType>(initial?.type ?? "repetition");
  const [status, setStatus] = useState<EventStatus>(initial?.status ?? "brouillon");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !eventDate) return;
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        description,
        event_date: new Date(eventDate).toISOString(),
        location,
        type,
        cover_url: initial?.cover_url ?? "",
        status,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={`${uid}-name`} className={labelClasses}>
          {t("eventForm.nameLabel")}
        </label>
        <input
          id={`${uid}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClasses}
          placeholder={t("eventForm.namePlaceholder")}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${uid}-date`} className={labelClasses}>
            {t("eventForm.dateLabel")}
          </label>
          <DateTimePicker id={`${uid}-date`} value={eventDate} onChange={setEventDate} />
        </div>
        <div>
          <label htmlFor={`${uid}-location`} className={labelClasses}>
            {t("eventForm.locationLabel")}
          </label>
          <input
            id={`${uid}-location`}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={fieldClasses}
            placeholder={t("eventForm.locationPlaceholder")}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${uid}-type`} className={labelClasses}>
            {t("eventForm.typeLabel")}
          </label>
          <select id={`${uid}-type`} value={type} onChange={(e) => setType(e.target.value as EventType)} className={fieldClasses}>
            {EVENT_TYPES.map((et) => (
              <option key={et} value={et}>
                {t(`eventTypes.${et}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-status`} className={labelClasses}>
            {t("eventForm.statusLabel")}
          </label>
          <select id={`${uid}-status`} value={status} onChange={(e) => setStatus(e.target.value as EventStatus)} className={fieldClasses}>
            {EVENT_STATUSES.map((es) => (
              <option key={es} value={es}>
                {t(`eventDetail.statusOptions.${es}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor={`${uid}-description`} className={labelClasses}>
          {t("eventForm.descriptionLabel")}
        </label>
        <textarea id={`${uid}-description`} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={fieldClasses} />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? t("eventForm.saving") : t("actions.save", { ns: "common" })}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 text-sm text-ink hover:border-accent"
        >
          {t("actions.cancel", { ns: "common" })}
        </button>
      </div>
    </div>
  );
}
