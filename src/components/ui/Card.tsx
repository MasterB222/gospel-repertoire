import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-border bg-surface/80 shadow-sm backdrop-blur-glass",
        className
      )}
      {...props}
    />
  );
}

interface MediaCardProps extends HTMLAttributes<HTMLDivElement> {
  media: ReactNode;
  title: string;
  subtitle?: string;
}

/**
 * Carte façon plateforme musicale : zone média (image ou dégradé) en tête,
 * élévation douce au survol. Prête pour Phase 2 (répertoire, artistes...).
 */
export function MediaCard({ media, title, subtitle, className, ...props }: MediaCardProps) {
  return (
    <div
      className={clsx(
        "group cursor-pointer rounded-2xl border border-border bg-surface p-3 transition-all duration-200",
        "hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-black/20",
        className
      )}
      {...props}
    >
      <div className="mb-3 aspect-square overflow-hidden rounded-xl">{media}</div>
      <p className="truncate text-sm font-semibold text-ink">{title}</p>
      {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
    </div>
  );
}
