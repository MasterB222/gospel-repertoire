import { useState } from "react";
import clsx from "clsx";

const WHITE_KEYS = ["c", "d", "e", "f", "g", "a", "b"];
// Touche noire placée juste après la touche blanche d'index correspondant (pas de noire après e ni après b).
const BLACK_AFTER: Record<string, string | null> = { c: "c#", d: "d#", e: null, f: "f#", g: "g#", a: "a#", b: null };

interface PianoKeyboardProps {
  fromOctave: number;
  toOctave: number;
  activeKey?: string | null;
  onPlay: (vexKey: string) => void;
}

export function PianoKeyboard({ fromOctave, toOctave, activeKey, onPlay }: PianoKeyboardProps) {
  const [pressed, setPressed] = useState<string | null>(null);
  const octaves: number[] = [];
  for (let o = fromOctave; o <= toOctave; o++) octaves.push(o);

  function press(vexKey: string) {
    setPressed(vexKey);
    onPlay(vexKey);
    window.setTimeout(() => setPressed((p) => (p === vexKey ? null : p)), 150);
  }

  return (
    <div className="flex overflow-x-auto rounded-lg border border-border bg-surface-raised p-2">
      <div className="relative flex">
        {octaves.map((octave) =>
          WHITE_KEYS.map((letter) => {
            const vexKey = `${letter}/${octave}`;
            const isActive = activeKey === vexKey || pressed === vexKey;
            const blackLetter = BLACK_AFTER[letter];
            return (
              <div key={vexKey} className="relative">
                <button
                  type="button"
                  onClick={() => press(vexKey)}
                  aria-label={`Note ${letter.toUpperCase()}${octave}`}
                  className={clsx(
                    // Les touches restent blanches/noires quel que soit le thème du
                    // site (comme un vrai piano) : le texte ne peut donc pas utiliser
                    // les jetons de thème (ink), sinon il devient illisible en sombre.
                    "h-24 w-9 shrink-0 rounded-b-md border border-border text-[10px] font-semibold uppercase transition-colors",
                    isActive ? "bg-accent text-[#2A0F1E]" : "bg-white text-[#2A0F1E]/60 hover:bg-accent/10"
                  )}
                >
                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2">{letter}{octave}</span>
                </button>
                {blackLetter && (
                  <button
                    type="button"
                    onClick={() => press(`${blackLetter}/${octave}`)}
                    aria-label={`Note ${blackLetter.toUpperCase()}${octave}`}
                    className={clsx(
                      "absolute -right-3 top-0 z-10 h-14 w-6 rounded-b-md border border-black/40 transition-colors",
                      activeKey === `${blackLetter}/${octave}` || pressed === `${blackLetter}/${octave}`
                        ? "bg-accent"
                        : "bg-[#2A0F1E] hover:bg-[#2A0F1E]/80"
                    )}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
