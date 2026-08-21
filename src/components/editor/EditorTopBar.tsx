import { Link } from "react-router-dom";
import { ArrowLeft, Check, Loader2, Rocket, Type } from "lucide-react";
import clsx from "clsx";
import { TransposeControl } from "./TransposeControl";
import type { NoteNotation } from "../../types/editor";

interface EditorTopBarProps {
  songId: string;
  title: string;
  timeSignature: string;
  bpm: string;
  saveStatus: "idle" | "saving" | "saved";
  version: string;
  notation: NoteNotation;
  onToggleNotation: () => void;
  onPublish: () => void;
  displayKey: string;
  pendingConfirm: boolean;
  canReset: boolean;
  onStep: (direction: 1 | -1) => void;
  onAnswer: (applyToChords: boolean) => void;
  onReset: () => void;
}

export function EditorTopBar(props: EditorTopBarProps) {
  return (
    <div className="border-b border-border bg-surface px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          to={`/songs/${props.songId}`}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
        </Link>

        <div className="min-w-0">
          <h1 className="truncate font-serif text-lg font-semibold text-ink">{props.title}</h1>
          <p className="text-xs text-muted">
            v{props.version} · {props.timeSignature} · {props.bpm} BPM
          </p>
        </div>

        <TransposeControl
          displayKey={props.displayKey}
          pendingConfirm={props.pendingConfirm}
          canReset={props.canReset}
          onStep={props.onStep}
          onAnswer={props.onAnswer}
          onReset={props.onReset}
        />

        <button
          onClick={props.onToggleNotation}
          className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-ink hover:border-accent"
        >
          <Type size={13} />
          {props.notation === "solfege" ? "do ré mi" : "C D E"}
        </button>

        <div className="ml-auto flex items-center gap-3">
          <span
            className={clsx(
              "flex items-center gap-1.5 text-xs",
              props.saveStatus === "saving" ? "text-muted" : "text-accent"
            )}
          >
            {props.saveStatus === "saving" ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Sauvegarde automatique…
              </>
            ) : props.saveStatus === "saved" ? (
              <>
                <Check size={13} />
                Enregistré
              </>
            ) : null}
          </span>

          <button
            onClick={props.onPublish}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-[#2A0F1E] hover:bg-accent-soft"
          >
            <Rocket size={13} />
            Publier
          </button>
        </div>
      </div>
    </div>
  );
}
