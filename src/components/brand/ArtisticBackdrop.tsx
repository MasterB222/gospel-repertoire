import type { ReactNode } from "react";
import clsx from "clsx";

interface ArtisticBackdropProps {
  imageUrl?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Fond artistique réutilisable (hero, panneau auth) : dégradé mesh chaud +
 * motif d'arcs concentrique en filigrane, avec un scrim bas pour la lisibilité
 * du texte superposé. Accepte `imageUrl` pour basculer sur une vraie photo
 * plus tard sans changer la structure.
 */
export function ArtisticBackdrop({ imageUrl, className, children }: ArtisticBackdropProps) {
  return (
    <div className={clsx("relative overflow-hidden", className)}>
      {imageUrl ? (
        <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 12% 8%, rgba(212,169,74,0.5), transparent 60%), radial-gradient(130% 100% at 88% 92%, rgba(151,36,74,0.65), transparent 60%), linear-gradient(160deg, #3A1224 0%, #200A16 100%)",
          }}
        />
      )}

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.14] mix-blend-overlay"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <circle cx="60" cy="360" r="40" fill="none" stroke="#F6E9DC" strokeWidth="1.5" />
        <circle cx="60" cy="360" r="90" fill="none" stroke="#F6E9DC" strokeWidth="1.5" />
        <circle cx="60" cy="360" r="140" fill="none" stroke="#F6E9DC" strokeWidth="1.5" />
        <circle cx="60" cy="360" r="190" fill="none" stroke="#F6E9DC" strokeWidth="1.5" />
      </svg>

      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />

      {children && <div className="relative">{children}</div>}
    </div>
  );
}
