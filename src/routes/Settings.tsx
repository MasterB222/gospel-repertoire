import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LogOut, Moon, Sun, Type } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { updateProfile } from "../lib/profile";
import { supabase } from "../lib/supabaseClient";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function Settings() {
  const { t } = useTranslation("pages");
  useDocumentTitle(t("settings.title"));
  const { profile, session, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleNotationChange(notation: "solfege" | "letters") {
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile(profile.id, { note_notation: notation });
      await refreshProfile();
      showToast(t("settings.preferenceSaved"), "success");
    } catch {
      showToast(t("settings.updateFailed"), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{t("settings.title")}</h1>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-muted">{t("settings.appearance")}</h2>
        <button
          onClick={toggleTheme}
          className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm text-ink hover:border-accent"
        >
          <span className="flex items-center gap-2">
            {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
            {theme === "dark" ? t("settings.themeDark") : t("settings.themeLight")}
          </span>
          <span className="text-xs text-accent-ink">{t("settings.change")}</span>
        </button>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted">
          <Type size={15} />
          {t("settings.musicNotation")}
        </h2>
        <div className="flex gap-2">
          <button
            disabled={saving}
            onClick={() => handleNotationChange("solfege")}
            className={`min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm ${
              profile?.note_notation === "solfege" ? "border-accent bg-accent/10 text-accent-ink" : "border-border text-ink"
            }`}
          >
            {t("settings.solfege")}
          </button>
          <button
            disabled={saving}
            onClick={() => handleNotationChange("letters")}
            className={`min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm ${
              profile?.note_notation === "letters" ? "border-accent bg-accent/10 text-accent-ink" : "border-border text-ink"
            }`}
          >
            {t("settings.letters")}
          </button>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-muted">{t("settings.account")}</h2>
        <p className="mb-3 break-all text-sm text-ink">{session?.user.email}</p>
        <Button variant="danger" onClick={() => supabase.auth.signOut()}>
          <LogOut size={15} />
          {t("settings.logout")}
        </Button>
      </Card>
    </div>
  );
}
