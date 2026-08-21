import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full text-accent"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(212,169,74,0.28), rgba(151,36,74,0.18) 70%)",
        }}
      >
        <Icon size={28} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <h3 className="font-serif text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action}
    </div>
  );
}
