import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { useAuth, type UserRole } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { listAllProfiles, updateUserRole, type AdminProfile } from "../../lib/admin";

const ROLES: UserRole[] = ["admin", "chef_choeur", "musicien", "chanteur", "choriste", "utilisateur"];
const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Responsable",
  chef_choeur: "Chef de chœur",
  musicien: "Musicien",
  chanteur: "Chanteur",
  choriste: "Choriste",
  utilisateur: "Utilisateur",
};

export function AdminUsers() {
  const { profile: currentProfile } = useAuth();
  const { showToast } = useToast();
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAllProfiles()
      .then(setProfiles)
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(id: string, role: UserRole) {
    const previous = profiles;
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, role } : p)));
    try {
      await updateUserRole(id, role);
      showToast("Rôle mis à jour.", "success");
    } catch {
      setProfiles(previous);
      showToast("Échec de la mise à jour du rôle.", "error");
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-ink sm:text-3xl">Admin — Utilisateurs</h1>

      {loading ? (
        <Skeleton className="h-60 w-full max-w-2xl" />
      ) : profiles.length === 0 ? (
        <EmptyState icon={Users} title="Aucun utilisateur" />
      ) : (
        <div className="max-w-2xl space-y-2">
          {profiles.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-raised px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {p.first_name} {p.last_name}
                </p>
              </div>
              <select
                value={p.role}
                disabled={p.id === currentProfile?.id}
                onChange={(e) => handleRoleChange(p.id, e.target.value as UserRole)}
                className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-ink focus:border-accent focus:outline-none disabled:opacity-50"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
