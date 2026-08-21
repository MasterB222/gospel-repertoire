import { Link } from "react-router-dom";
import { Music2 } from "lucide-react";
import { MediaCard } from "../ui/Card";
import { CoverPlaceholder } from "./CoverPlaceholder";
import type { Song } from "../../types/catalog";

export function SongCard({ song }: { song: Song }) {
  return (
    <Link to={`/songs/${song.id}`} className="block">
      <MediaCard
        media={<CoverPlaceholder icon={Music2} imageUrl={song.cover_url || undefined} alt={song.title} />}
        title={song.title}
        subtitle={song.artist?.name ?? "Artiste inconnu"}
      />
    </Link>
  );
}
