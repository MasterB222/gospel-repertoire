import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";
import type { EntityInput } from "../../lib/admin";

const fieldClasses =
  "w-full rounded-lg border border-border bg-surface-raised px-2.5 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

interface EntityFormProps {
  initial?: EntityInput;
  nameLabel: string;
  descriptionLabel: string;
  onSubmit: (input: EntityInput) => Promise<void>;
  onCancel: () => void;
}

export function EntityForm({ initial, nameLabel, descriptionLabel, onSubmit, onCancel }: EntityFormProps) {
  const { t } = useTranslation("admin");
  const uid = useId();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ name: name.trim(), description, image_url: imageUrl });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2.5 rounded-xl border border-border p-3">
      <div>
        <label htmlFor={`${uid}-name`} className="mb-1 block text-xs font-semibold text-muted">
          {nameLabel}
        </label>
        <input id={`${uid}-name`} value={name} onChange={(e) => setName(e.target.value)} className={fieldClasses} />
      </div>
      <div>
        <label htmlFor={`${uid}-description`} className="mb-1 block text-xs font-semibold text-muted">
          {descriptionLabel}
        </label>
        <textarea
          id={`${uid}-description`}
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={fieldClasses}
        />
      </div>
      <div>
        <label htmlFor={`${uid}-image`} className="mb-1 block text-xs font-semibold text-muted">
          {t("entityForm.imageUrlLabel")}
        </label>
        <input id={`${uid}-image`} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={fieldClasses} placeholder="https://..." />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? t("entityForm.saving") : t("entityForm.save")}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          {t("entityForm.cancel")}
        </Button>
      </div>
    </div>
  );
}
