import { Link } from "react-router-dom";
import { Music2, Play } from "lucide-react";
import { MediaCard } from "../ui/Card";
import { CoverPlaceholder } from "./CoverPlaceholder";
import { FavoriteButton } from "./FavoriteButton";
import { usePlayer } from "../../context/PlayerContext";
import type { Song } from "../../types/catalog";

export function SongCard({ song, queue }: { song: Song; queue?: Song[] }) {
  const { playSong } = usePlayer();

  return (
    <Link to={`/songs/${song.id}`} className="block">
      <MediaCard
        media={
          <div className="group/media relative h-full w-full">
            <CoverPlaceholder icon={Music2} imageUrl={song.cover_url || undefined} alt={song.title} />
            <FavoriteButton
              songId={song.id}
              className="absolute right-2 top-2 h-8 w-8 bg-black/40 opacity-0 backdrop-blur-glass transition-opacity group-hover:opacity-100"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                playSong(song, queue);
              }}
              aria-label={`Écouter ${song.title}`}
              className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-[#2A0F1E] opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
            >
              <Play size={16} className="ml-0.5" />
            </button>
          </div>
        }
        title={song.title}
        subtitle={song.artist?.name ?? "Artiste inconnu"}
      />
    </Link>
  );
}
