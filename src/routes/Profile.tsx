import { useEffect, useState } from "react";
import { Heart, ListMusic, Music2, Save } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { updateProfile } from "../lib/profile";
import { listFavoriteSongs, listHistory, listPlaylists } from "../lib/library";

const ROLE_LABELS: Record<string, string> = {
  admin: "Responsable",
  chef_choeur: "Chef de chœur",
  musicien: "Musicien",
  chanteur: "Chanteur",
  choriste: "Choriste",
  utilisateur: "Utilisateur",
};

export function Profile() {
  const { profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<{ favorites: number; playlists: number; viewed: number } | null>(null);

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
      showToast("Profil mis à jour.", "success");
    } catch {
      showToast("Échec de la mise à jour.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-ink sm:text-3xl">Profil</h1>

      <div className="mb-6 flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-[#2A0F1E]">
          {profile.first_name?.[0]?.toUpperCase() ?? "?"}
        </span>
        <div>
          <p className="font-serif text-lg font-semibold text-ink">
            {profile.first_name} {profile.last_name}
          </p>
          <p className="text-sm text-muted">{ROLE_LABELS[profile.role] ?? profile.role}</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <Heart size={16} className="mx-auto mb-1 text-accent" />
          <p className="text-xl font-bold text-ink">{stats?.favorites ?? "—"}</p>
          <p className="text-xs text-muted">Favoris</p>
        </Card>
        <Card className="p-4 text-center">
          <ListMusic size={16} className="mx-auto mb-1 text-accent" />
          <p className="text-xl font-bold text-ink">{stats?.playlists ?? "—"}</p>
          <p className="text-xs text-muted">Playlists</p>
        </Card>
        <Card className="p-4 text-center">
          <Music2 size={16} className="mx-auto mb-1 text-accent" />
          <p className="text-xl font-bold text-ink">{stats?.viewed ?? "—"}</p>
          <p className="text-xs text-muted">Consultées</p>
        </Card>
      </div>

      <Card className="space-y-3 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">Prénom</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">Nom</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save size={15} />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </Card>
    </div>
  );
}
