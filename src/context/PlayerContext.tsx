import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { extractYouTubeId, loadYouTubeIframeApi, YT_PLAYER_STATE, type YTPlayer } from "../lib/youtube";
import type { Song } from "../types/catalog";

export type RepeatMode = "off" | "all" | "one";

interface PlayerContextValue {
  queue: Song[];
  currentSong: Song | null;
  currentIndex: number;
  isPlaying: boolean;
  hasVideo: boolean;
  error: string | null;
  volume: number;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeatMode: RepeatMode;
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

function shuffledIndices(length: number, exclude: number): number[] {
  const rest = Array.from({ length }, (_, i) => i).filter((i) => i !== exclude);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [exclude, ...rest];
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(80);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shuffleOrderRef = useRef<number[]>([]);
  const shufflePosRef = useRef(0);
  const progressTimer = useRef<number | null>(null);

  const currentSong = currentIndex >= 0 ? queue[currentIndex] ?? null : null;
  const hasVideo = !!currentSong?.youtube_url && !!extractYouTubeId(currentSong.youtube_url);

  const ensurePlayer = useCallback(async () => {
    if (playerRef.current) return playerRef.current;
    await loadYouTubeIframeApi();
    if (!containerRef.current) return null;
    return new Promise<YTPlayer>((resolve) => {
      const player = new window.YT!.Player(containerRef.current!, {
        height: "1",
        width: "1",
        playerVars: { controls: 0, disablekb: 1 },
        events: {
          onReady: () => {
            playerRef.current = player;
            resolve(player);
          },
          onStateChange: (e) => {
            if (e.data === YT_PLAYER_STATE.ENDED) handleEnded();
            setIsPlaying(e.data === YT_PLAYER_STATE.PLAYING);
          },
        },
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleEnded() {
    if (repeatModeRef.current === "one") {
      playerRef.current?.seekTo(0, true);
      playerRef.current?.playVideo();
      return;
    }
    goNext();
  }

  // Refs pour lire l'état courant dans les callbacks YT sans les redéclarer à chaque render
  const repeatModeRef = useRef(repeatMode);
  repeatModeRef.current = repeatMode;
  const queueRef = useRef(queue);
  queueRef.current = queue;
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;
  const shuffleRef = useRef(shuffle);
  shuffleRef.current = shuffle;

  function goNext() {
    const q = queueRef.current;
    if (q.length === 0) return;
    if (shuffleRef.current) {
      shufflePosRef.current += 1;
      if (shufflePosRef.current >= shuffleOrderRef.current.length) {
        if (repeatModeRef.current === "all") shufflePosRef.current = 0;
        else return;
      }
      loadIndex(shuffleOrderRef.current[shufflePosRef.current]);
      return;
    }
    let nextIdx = currentIndexRef.current + 1;
    if (nextIdx >= q.length) {
      if (repeatModeRef.current === "all") nextIdx = 0;
      else return;
    }
    loadIndex(nextIdx);
  }

  function goPrev() {
    const q = queueRef.current;
    if (q.length === 0) return;
    if (shuffleRef.current) {
      shufflePosRef.current = Math.max(0, shufflePosRef.current - 1);
      loadIndex(shuffleOrderRef.current[shufflePosRef.current]);
      return;
    }
    const prevIdx = currentIndexRef.current - 1 < 0 ? 0 : currentIndexRef.current - 1;
    loadIndex(prevIdx);
  }

  async function loadIndex(index: number) {
    const q = queueRef.current;
    const song = q[index];
    if (!song) return;
    setCurrentIndex(index);
    setError(null);
    const videoId = song.youtube_url ? extractYouTubeId(song.youtube_url) : null;
    if (!videoId) {
      setError("Aucune vidéo disponible pour cette chanson.");
      setIsPlaying(false);
      return;
    }
    const player = await ensurePlayer();
    player?.loadVideoById(videoId);
    player?.setVolume(volume);
    player?.playVideo();
  }

  const playSong = useCallback(
    (song: Song, newQueue?: Song[]) => {
      const q = newQueue && newQueue.length > 0 ? newQueue : [song];
      const idx = q.findIndex((s) => s.id === song.id);
      setQueue(q);
      queueRef.current = q;
      shuffleOrderRef.current = shuffledIndices(q.length, idx === -1 ? 0 : idx);
      shufflePosRef.current = 0;
      loadIndex(idx === -1 ? 0 : idx);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  }, [isPlaying]);

  const seek = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
    setProgress(seconds);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    playerRef.current?.setVolume(v);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((s) => {
      const next = !s;
      if (next) {
        shuffleOrderRef.current = shuffledIndices(queueRef.current.length, currentIndexRef.current);
        shufflePosRef.current = 0;
      }
      return next;
    });
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (progressTimer.current) window.clearInterval(progressTimer.current);
      return;
    }
    progressTimer.current = window.setInterval(() => {
      const p = playerRef.current;
      if (p) {
        setProgress(p.getCurrentTime());
        setDuration(p.getDuration());
      }
    }, 500);
    return () => {
      if (progressTimer.current) window.clearInterval(progressTimer.current);
    };
  }, [isPlaying]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      queue,
      currentSong,
      currentIndex,
      isPlaying,
      hasVideo,
      error,
      volume,
      progress,
      duration,
      shuffle,
      repeatMode,
      playSong,
      togglePlay,
      next: goNext,
      prev: goPrev,
      seek,
      setVolume,
      toggleShuffle,
      cycleRepeat,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queue, currentSong, currentIndex, isPlaying, hasVideo, error, volume, progress, duration, shuffle, repeatMode]
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <div ref={containerRef} className="fixed bottom-0 left-0 h-px w-px overflow-hidden opacity-0" aria-hidden="true" />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within a PlayerProvider");
  return ctx;
}
