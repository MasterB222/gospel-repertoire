import { useState, type FormEvent } from "react";
import { Wand2 } from "lucide-react";

export function QuickEntryBar({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="mb-3 flex items-center gap-2">
      <Wand2 size={16} strokeWidth={1.8} className="shrink-0 text-accent" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder='Saisie rapide des notes : "do do sol fa" — réparties dans les mesures'
        className="w-full max-w-md rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
      />
      <button type="submit" className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:border-accent">
        Répartir
      </button>
    </form>
  );
}
