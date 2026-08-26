import { useEffect, useState } from "react";
import { Music2, Mic2, LayoutGrid, Users, ListMusic, Heart, Circle } from "lucide-react";
import { StatCard } from "../../components/admin/StatCard";
import { BarChart } from "../../components/admin/BarChart";
import { Card } from "../../components/ui/Card";
import { Skeleton } from "../../components/ui/Skeleton";
import { getAdminStats, type AdminStats } from "../../lib/admin";
import { useOnlineUsers } from "../../context/PresenceContext";

const ROLE_LABELS: Record<string, string> = {
  admin: "Responsable",
  chef_choeur: "Chef de chœur",
  musicien: "Musicien",
  chanteur: "Chanteur",
  choriste: "Choriste",
  utilisateur: "Utilisateur",
};

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const onlineUsers = useOnlineUsers();

  useEffect(() => {
    getAdminStats().then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-ink sm:text-3xl">Dashboard admin</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Music2} label="Chansons" value={stats.songs} />
        <StatCard icon={Music2} label="Brouillons" value={stats.drafts} />
        <StatCard icon={Mic2} label="Artistes" value={stats.artists} />
        <StatCard icon={LayoutGrid} label="Catégories" value={stats.categories} />
        <StatCard icon={Users} label="Utilisateurs" value={stats.users} />
        <StatCard icon={ListMusic} label="Playlists" value={stats.playlists} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <BarChart title="Chansons par catégorie" data={stats.songsByCategory} />
        <BarChart title="Utilisateurs par rôle" data={stats.usersByRole} />
      </div>

      <Card className="mt-4 p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted">
          <Circle size={9} className="fill-emerald-400 text-emerald-400" />
          En ligne maintenant ({onlineUsers.length})
        </h3>
        {onlineUsers.length === 0 ? (
          <p className="text-xs text-muted">Personne d'autre n'est connecté en ce moment.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {onlineUsers.map((u) => (
              <span
                key={u.id}
                className="flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-2.5 py-1.5 text-xs text-ink"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-[#2A0F1E]">
                  {u.name.charAt(0).toUpperCase()}
                </span>
                {u.name}
                <span className="text-muted">· {ROLE_LABELS[u.role] ?? u.role}</span>
              </span>
            ))}
          </div>
        )}
      </Card>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm text-muted">
        <Heart size={16} className="text-accent-ink" />
        {stats.favorites} favoris enregistrés au total
      </div>
    </div>
  );
}
