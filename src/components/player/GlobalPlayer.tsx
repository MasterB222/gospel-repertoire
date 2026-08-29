import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2, VolumeX } from "lucide-react";
import { usePlayer } from "../../context/PlayerContext";
import { CoverPlaceholder } from "../catalog/CoverPlaceholder";
import { Music2 } from "lucide-react";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function GlobalPlayer() {
  const { t } = useTranslation("playlists");
  const {
    currentSong,
    isPlaying,
    error,
    volume,
    progress,
    duration,
    shuffle,
    repeatMode,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer();

  if (!currentSong) return null;

  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;

  return (
    <div className="fixed inset-x-0 bottom-14 z-40 border-t border-border bg-surface/95 backdrop-blur-glass md:bottom-0 md:left-64">
      {error && <p className="bg-danger/15 px-3 py-1 text-center text-xs text-danger">{error}</p>}

      <div className="flex items-center gap-3 px-3 py-2 sm:px-4">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
          <CoverPlaceholder icon={Music2} imageUrl={currentSong.cover_url || undefined} alt={currentSong.title} />
        </div>
        <div className="min-w-0 flex-1 sm:w-40 sm:flex-none">
          <p className="truncate text-sm font-semibold text-ink">{currentSong.title}</p>
          <p className="truncate text-xs text-muted">{currentSong.artist?.name ?? t("player.unknownArtist")}</p>
        </div>

        <div className="flex flex-1 items-center justify-center gap-1 sm:gap-2">
          <button onClick={toggleShuffle} className={clsx("hidden rounded-lg p-1.5 sm:block", shuffle ? "text-accent-ink" : "text-muted hover:text-ink")} aria-label={t("player.shuffle")}>
            <Shuffle size={16} />
          </button>
          <button onClick={prev} className="rounded-lg p-1.5 text-ink hover:text-accent-ink" aria-label={t("player.previous")}>
            <SkipBack size={18} />
          </button>
          <button
            onClick={togglePlay}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-[#2A0F1E] hover:bg-accent-soft"
            aria-label={isPlaying ? t("player.pause") : t("player.play")}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
          <button onClick={next} className="rounded-lg p-1.5 text-ink hover:text-accent-ink" aria-label={t("player.next")}>
            <SkipForward size={18} />
          </button>
          <button onClick={cycleRepeat} className={clsx("hidden rounded-lg p-1.5 sm:block", repeatMode !== "off" ? "text-accent-ink" : "text-muted hover:text-ink")} aria-label={t("player.repeat")}>
            <RepeatIcon size={16} />
          </button>
        </div>

        <div className="hidden flex-1 items-center gap-2 md:flex">
          <span className="w-9 text-right text-[11px] text-muted">{formatTime(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={progress}
            onChange={(e) => seek(Number(e.target.value))}
            className="h-1 flex-1 accent-accent"
          />
          <span className="w-9 text-[11px] text-muted">{formatTime(duration)}</span>
        </div>

        <div className="hidden items-center gap-1.5 lg:flex">
          {volume === 0 ? <VolumeX size={16} className="text-muted" /> : <Volume2 size={16} className="text-muted" />}
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1 w-20 accent-accent"
          />
        </div>
      </div>
    </div>
  );
}
