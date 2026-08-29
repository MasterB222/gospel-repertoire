import { Link } from "react-router-dom";
import { ArrowLeft, Check, Loader2, Rocket } from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { TransposeControl } from "./TransposeControl";
import { PresenceAvatars } from "../collaboration/PresenceAvatars";
import type { NoteNotation } from "../../types/editor";

const NOTATION_OPTIONS: { value: NoteNotation; label: string }[] = [
  { value: "letters", label: "C D E" },
  { value: "solfege", label: "do ré mi" },
  { value: "nashville", label: "1 2 3" },
];

interface EditorTopBarProps {
  songId: string;
  title: string;
  timeSignature: string;
  bpm: string;
  onChangeBpm: (value: string) => void;
  saveStatus: "idle" | "saving" | "saved";
  version: string;
  notation: NoteNotation;
  onSetNotation: (notation: NoteNotation) => void;
  onPublish: () => void;
  displayKey: string;
  pendingConfirm: boolean;
  canReset: boolean;
  onStep: (direction: 1 | -1) => void;
  onAnswer: (applyToChords: boolean) => void;
  onReset: () => void;
  presentUsers: { id: string; name: string }[];
}

export function EditorTopBar(props: EditorTopBarProps) {
  const { t } = useTranslation("editor");
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
          <div className="flex items-center gap-1 text-xs text-muted">
            <span>
              v{props.version} · {props.timeSignature} ·
            </span>
            <input
              type="number"
              min={20}
              max={300}
              value={props.bpm}
              onChange={(e) => props.onChangeBpm(e.target.value)}
              aria-label={t("topBar.tempoLabel")}
              className="w-12 rounded border border-border bg-surface-raised px-1 py-0.5 text-center text-xs text-ink focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            />
            <span>BPM</span>
          </div>
        </div>

        <TransposeControl
          displayKey={props.displayKey}
          pendingConfirm={props.pendingConfirm}
          canReset={props.canReset}
          onStep={props.onStep}
          onAnswer={props.onAnswer}
          onReset={props.onReset}
        />

        <div className="flex items-center rounded-lg border border-border p-0.5 text-xs">
          {NOTATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => props.onSetNotation(opt.value)}
              className={clsx(
                "rounded-md px-2 py-1 transition-colors",
                props.notation === opt.value ? "bg-accent text-[#2A0F1E] font-semibold" : "text-ink hover:bg-surface-raised"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <PresenceAvatars users={props.presentUsers} />
          <span
            className={clsx(
              "flex items-center gap-1.5 text-xs",
              props.saveStatus === "saving" ? "text-muted" : "text-accent-ink"
            )}
          >
            {props.saveStatus === "saving" ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                {t("topBar.autoSaving")}
              </>
            ) : props.saveStatus === "saved" ? (
              <>
                <Check size={13} />
                {t("topBar.saved")}
              </>
            ) : null}
          </span>

          <button
            onClick={props.onPublish}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-[#2A0F1E] hover:bg-accent-soft"
          >
            <Rocket size={13} />
            {t("topBar.publish")}
          </button>
        </div>
      </div>
    </div>
  );
}
