import { Link } from "react-router-dom";
import { Mic2 } from "lucide-react";
import { MediaCard } from "../ui/Card";
import { CoverPlaceholder } from "./CoverPlaceholder";
import type { Artist } from "../../types/catalog";

export function ArtistCard({ artist, songCount }: { artist: Artist; songCount: number }) {
  return (
    <Link to={`/artists/${artist.id}`} className="block">
      <MediaCard
        media={<CoverPlaceholder icon={Mic2} imageUrl={artist.image_url || undefined} alt={artist.name} />}
        title={artist.name}
        subtitle={`${songCount} chanson${songCount > 1 ? "s" : ""}`}
      />
    </Link>
  );
}
