import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Camera, Heart, ListMusic, Music2, Save, X } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { updateProfile } from "../lib/profile";
import { deleteAvatar, uploadAvatar } from "../lib/storage";
import { listFavoriteSongs, listHistory, listPlaylists } from "../lib/library";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export function Profile() {
  const { t } = useTranslation(["pages", "common"]);
  useDocumentTitle(t("profile.title"));
  const { profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [stats, setStats] = useState<{ favorites: number; playlists: number; viewed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.first_name);
    setLastName(profile.last_name);
    Promise.all([listFavoriteSongs(profile.id), listPlaylists(profile.id), listHistory(profile.id, 200)]).then(
      ([f, p, h]) => setStats({ favorites: f.length, playlists: p.length, viewed: h.length })
    );
  }, [profile]);

  if (!profile) return <Skeleton className="h-40 w-full" />;

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile(profile!.id, { first_name: firstName.trim(), last_name: lastName.trim() });
      await refreshProfile();
      showToast(t("profile.toasts.profileUpdated"), "success");
    } catch {
      showToast(t("profile.toasts.updateFailed"), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !profile) return;

    if (!file.type.startsWith("image/")) {
      showToast(t("profile.toasts.chooseImageFile"), "error");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      showToast(t("profile.toasts.imageTooLarge"), "error");
      return;
    }

    setUploadingAvatar(true);
    try {
      const url = await uploadAvatar(profile.id, file);
      await updateProfile(profile.id, { avatar_url: url });
      await refreshProfile();
      showToast(t("profile.toasts.avatarUpdated"), "success");
    } catch {
      showToast(t("profile.toasts.avatarUploadFailed"), "error");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleRemoveAvatar() {
    if (!profile?.avatar_url) return;

    setUploadingAvatar(true);
    try {
      await deleteAvatar(profile.avatar_url);
      await updateProfile(profile.id, { avatar_url: null });
      await refreshProfile();
      showToast(t("profile.toasts.avatarRemoved"), "success");
    } catch {
      showToast(t("profile.toasts.avatarRemoveFailed"), "error");
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-ink sm:text-3xl">{t("profile.title")}</h1>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            aria-label={t("profile.changeAvatar")}
            className="group relative h-16 w-16 overflow-hidden rounded-full bg-accent text-2xl font-bold text-[#2A0F1E] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                {profile.first_name?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera size={18} className="text-white" />
            </span>
          </button>
          {profile.avatar_url && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={uploadingAvatar}
              aria-label={t("profile.removeAvatar")}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface-raised text-muted shadow ring-1 ring-border hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
        <div>
          <p className="font-serif text-lg font-semibold text-ink">
            {profile.first_name} {profile.last_name}
          </p>
          <p className="text-sm text-muted">{t(`roles.${profile.role}`, { ns: "common", defaultValue: profile.role })}</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <Heart size={16} className="mx-auto mb-1 text-accent-ink" />
          <p className="text-xl font-bold text-ink">{stats?.favorites ?? "—"}</p>
          <p className="text-xs text-muted">{t("profile.stats.favorites")}</p>
        </Card>
        <Card className="p-4 text-center">
          <ListMusic size={16} className="mx-auto mb-1 text-accent-ink" />
          <p className="text-xl font-bold text-ink">{stats?.playlists ?? "—"}</p>
          <p className="text-xs text-muted">{t("profile.stats.playlists")}</p>
        </Card>
        <Card className="p-4 text-center">
          <Music2 size={16} className="mx-auto mb-1 text-accent-ink" />
          <p className="text-xl font-bold text-ink">{stats?.viewed ?? "—"}</p>
          <p className="text-xs text-muted">{t("profile.stats.viewed")}</p>
        </Card>
      </div>

      <Card className="space-y-3 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">{t("profile.firstName")}</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">{t("profile.lastName")}</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save size={15} />
          {saving ? t("profile.saving") : t("profile.save")}
        </Button>
      </Card>
    </div>
  );
}
