import { useEffect, useState } from "react";
import { Music2, Mic2, LayoutGrid, Users, ListMusic, Heart } from "lucide-react";
import { StatCard } from "../../components/admin/StatCard";
import { BarChart } from "../../components/admin/BarChart";
import { Skeleton } from "../../components/ui/Skeleton";
import { getAdminStats, type AdminStats } from "../../lib/admin";

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

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

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm text-muted">
        <Heart size={16} className="text-accent" />
        {stats.favorites} favoris enregistrés au total
      </div>
    </div>
  );
}
