import { Minus, Plus, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TransposeControlProps {
  displayKey: string;
  pendingConfirm: boolean;
  canReset: boolean;
  onStep: (direction: 1 | -1) => void;
  onAnswer: (applyToChords: boolean) => void;
  onReset: () => void;
}

export function TransposeControl({ displayKey, pendingConfirm, canReset, onStep, onAnswer, onReset }: TransposeControlProps) {
  const { t } = useTranslation(["editor", "common"]);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onStep(-1)}
          aria-label={t("transpose.downLabel")}
          className="rounded-lg border border-border p-1.5 text-ink hover:border-accent"
        >
          <Minus size={14} />
        </button>
        <span className="min-w-[4.5rem] text-center text-sm font-semibold text-ink">{displayKey || "—"}</span>
        <button
          onClick={() => onStep(1)}
          aria-label={t("transpose.upLabel")}
          className="rounded-lg border border-border p-1.5 text-ink hover:border-accent"
        >
          <Plus size={14} />
        </button>
        {canReset && (
          <button
            onClick={onReset}
            aria-label={t("transpose.resetLabel")}
            className="ml-1 flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted hover:text-ink"
          >
            <RotateCcw size={13} />
            {t("actions.reset", { ns: "common" })}
          </button>
        )}
      </div>

      {pendingConfirm && (
        <div className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1.5 text-xs text-ink">
          {t("transpose.confirmPrompt")}
          <button onClick={() => onAnswer(true)} className="font-semibold text-accent-ink hover:underline">
            {t("transpose.yes")}
          </button>
          <button onClick={() => onAnswer(false)} className="text-muted hover:underline">
            {t("transpose.no")}
          </button>
        </div>
      )}
    </div>
  );
}
