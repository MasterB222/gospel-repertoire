import { useState } from "react";
import { Pin } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Comment } from "../../types/collaboration";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

export function CommentThread({ comments, onAdd }: { comments: Comment[]; onAdd: (text: string) => void }) {
  const { t } = useTranslation("editor");
  const [text, setText] = useState("");

  return (
    <div className="space-y-2">
      {comments.length === 0 && <p className="text-xs text-muted">{t("comments.empty")}</p>}
      {comments.map((c) => (
        <div key={c.id} className="flex items-start gap-1.5 rounded-lg bg-surface-raised px-2.5 py-2 text-xs">
          <Pin size={12} className="mt-0.5 shrink-0 text-accent-ink" />
          <div className="min-w-0">
            <p className="text-ink">{c.text}</p>
            <p className="mt-0.5 text-[11px] text-muted">
              {c.author ? `${c.author.first_name} ${c.author.last_name}` : t("comments.anonymous")} · {formatDate(c.created_at)}
              {c.measure_number != null && ` · ${t("comments.measureLabel", { number: c.measure_number })}`}
            </p>
          </div>
        </div>
      ))}
      <div className="flex gap-1.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("comments.placeholder")}
          className="flex-1 rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-xs text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
        <button
          onClick={() => {
            if (!text.trim()) return;
            onAdd(text.trim());
            setText("");
          }}
          className="rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-[#2A0F1E] hover:bg-accent-soft"
        >
          {t("comments.send")}
        </button>
      </div>
    </div>
  );
}
