import type { LucideIcon } from "lucide-react";

/**
 * Vignette dégradée utilisée tant qu'aucune vraie image (chanson/artiste/
 * catégorie) n'est disponible. Même langage visuel que le hero (ArtisticBackdrop),
 * décliné en plus petit format.
 */
export function CoverPlaceholder({ icon: Icon, imageUrl, alt }: { icon: LucideIcon; imageUrl?: string; alt: string }) {
  if (imageUrl) {
    return <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />;
  }

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        background:
          "radial-gradient(120% 120% at 20% 15%, rgba(212,169,74,0.45), transparent 60%), radial-gradient(120% 120% at 85% 90%, rgba(151,36,74,0.6), transparent 60%), linear-gradient(160deg, #3A1224 0%, #200A16 100%)",
      }}
    >
      {/* Fond toujours sombre (même dégradé que ArtisticBackdrop) : couleur fixe,
          pas le jeton de thème "ink" qui deviendrait sombre-sur-sombre en clair. */}
      <Icon size={28} strokeWidth={1.5} className="text-[#F6E9DC]/50" aria-hidden="true" />
    </div>
  );
}
