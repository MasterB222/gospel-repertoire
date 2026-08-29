import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Music2, Mic2, LayoutGrid, Users, ListMusic, Heart, Circle } from "lucide-react";
import { StatCard } from "../../components/admin/StatCard";
import { BarChart } from "../../components/admin/BarChart";
import { Card } from "../../components/ui/Card";
import { Skeleton } from "../../components/ui/Skeleton";
import { getAdminStats, type AdminStats } from "../../lib/admin";
import { useOnlineUsers } from "../../context/PresenceContext";

export function AdminDashboard() {
  const { t } = useTranslation(["admin", "common"]);
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
      <h1 className="mb-6 font-serif text-2xl font-semibold text-ink sm:text-3xl">{t("dashboard.title")}</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Music2} label={t("dashboard.stats.songs")} value={stats.songs} />
        <StatCard icon={Music2} label={t("dashboard.stats.drafts")} value={stats.drafts} />
        <StatCard icon={Mic2} label={t("dashboard.stats.artists")} value={stats.artists} />
        <StatCard icon={LayoutGrid} label={t("dashboard.stats.categories")} value={stats.categories} />
        <StatCard icon={Users} label={t("dashboard.stats.users")} value={stats.users} />
        <StatCard icon={ListMusic} label={t("dashboard.stats.playlists")} value={stats.playlists} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <BarChart title={t("dashboard.charts.songsByCategory")} data={stats.songsByCategory} />
        <BarChart title={t("dashboard.charts.usersByRole")} data={stats.usersByRole} />
      </div>

      <Card className="mt-4 p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted">
          <Circle size={9} className="fill-emerald-400 text-emerald-400" />
          {t("dashboard.onlineNow", { count: onlineUsers.length })}
        </h3>
        {onlineUsers.length === 0 ? (
          <p className="text-xs text-muted">{t("dashboard.noOneElseOnline")}</p>
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
                <span className="text-muted">· {t(`roles.${u.role}`, { ns: "common", defaultValue: u.role })}</span>
              </span>
            ))}
          </div>
        )}
      </Card>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm text-muted">
        <Heart size={16} className="text-accent-ink" />
        {t("dashboard.totalFavorites", { count: stats.favorites })}
      </div>
    </div>
  );
}
