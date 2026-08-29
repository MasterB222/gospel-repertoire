import { useState } from "react";
import clsx from "clsx";
import { GripVertical, Plus, Pencil, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Section } from "../../types/editor";

interface SectionListProps {
  sections: Section[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
}

export function SectionList({
  sections,
  selectedId,
  onSelect,
  onAdd,
  onRename,
  onDuplicate,
  onDelete,
  onToggleHidden,
  onReorder,
}: SectionListProps) {
  const { t } = useTranslation("editor");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);

  function startEdit(section: Section) {
    setEditingId(section.id);
    setDraftName(section.name);
  }

  function commitEdit() {
    if (editingId && draftName.trim()) onRename(editingId, draftName.trim());
    setEditingId(null);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{t("sectionList.title")}</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-accent-ink hover:bg-accent/10"
        >
          <Plus size={14} strokeWidth={2} />
          {t("sectionList.addSection")}
        </button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto">
        {sections.map((section) => (
          <div
            key={section.id}
            draggable
            onDragStart={() => setDragId(section.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId && dragId !== section.id) onReorder(dragId, section.id);
              setDragId(null);
            }}
            className={clsx(
              "group flex items-center gap-1.5 rounded-xl border px-2 py-2 transition-colors",
              selectedId === section.id ? "border-accent bg-accent/10" : "border-transparent hover:bg-surface-raised",
              section.hidden && "opacity-50"
            )}
          >
            <GripVertical size={14} className="shrink-0 cursor-grab text-muted" />

            {editingId === section.id ? (
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => e.key === "Enter" && commitEdit()}
                className="min-w-0 flex-1 rounded border border-accent bg-surface px-1.5 py-0.5 text-sm text-ink"
              />
            ) : (
              <button
                onClick={() => onSelect(section.id)}
                className="min-w-0 flex-1 truncate text-left text-sm text-ink"
              >
                {section.name}
              </button>
            )}

            <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
              <button onClick={() => startEdit(section)} aria-label={t("sectionList.rename")} className="rounded p-1 text-muted hover:text-ink">
                <Pencil size={13} />
              </button>
              <button onClick={() => onDuplicate(section.id)} aria-label={t("sectionList.duplicate")} className="rounded p-1 text-muted hover:text-ink">
                <Copy size={13} />
              </button>
              <button onClick={() => onToggleHidden(section.id)} aria-label={t("sectionList.hide")} className="rounded p-1 text-muted hover:text-ink">
                {section.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button onClick={() => onDelete(section.id)} aria-label={t("sectionList.delete")} className="rounded p-1 text-muted hover:text-danger">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
