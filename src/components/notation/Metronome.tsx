import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { playMetronomeClick, quarterNoteSeconds } from "../../lib/notation";

export function Metronome({ bpm, beatsPerMeasure }: { bpm: number; beatsPerMeasure: number }) {
  const [running, setRunning] = useState(false);
  const beatRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    beatRef.current = 0;
    const intervalMs = quarterNoteSeconds(bpm) * 1000;
    playMetronomeClick(true);
    const id = window.setInterval(() => {
      beatRef.current = (beatRef.current + 1) % Math.max(1, beatsPerMeasure);
      playMetronomeClick(beatRef.current === 0);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [running, bpm, beatsPerMeasure]);

  return (
    <button
      type="button"
      onClick={() => setRunning((r) => !r)}
      className={`flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold ${
        running ? "border-accent bg-accent/20 text-accent" : "border-border text-ink hover:border-accent/40"
      }`}
      title="Métronome"
    >
      {running ? <Volume2 size={14} /> : <VolumeX size={14} />}
      Métronome {bpm || 90} BPM
    </button>
  );
}
