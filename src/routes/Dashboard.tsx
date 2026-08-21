import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Users } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { AssignmentCard } from "../components/collaboration/AssignmentCard";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  listAllAssignments,
  listAssignmentsForUser,
  listGroupMembers,
  listGroups,
  listRecentComments,
  updateAssignmentStatus,
} from "../lib/collaboration";
import type { Assignment, Comment, Group, GroupMember } from "../types/collaboration";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

function ChefDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [comments, setComments] = useState<(Comment & { song: { id: string; title: string } | null })[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listAllAssignments(), listRecentComments(8), listGroups()]).then(async ([a, c, groups]) => {
      setAssignments(a);
      setComments(c);
      if (groups[0]) {
        setGroup(groups[0]);
        setMembers(await listGroupMembers(groups[0].id));
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const toRevisit = assignments.filter((a) => a.status === "a_revoir").length;
  const songsInProgress = new Set(assignments.filter((a) => a.status === "en_cours").map((a) => a.song_id)).size;
  const songsDone = new Set(assignments.filter((a) => a.status === "termine").map((a) => a.song_id)).size;

  const activity = [
    ...assignments.map((a) => ({ at: a.updated_at, kind: "assignment" as const, data: a })),
    ...comments.map((c) => ({ at: c.created_at, kind: "comment" as const, data: c })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8);

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-ink sm:text-3xl">Dashboard chef de chœur</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-3xl font-bold text-danger">{toRevisit}</p>
          <p className="text-sm text-muted">Assignations à revoir</p>
        </Card>
        <Card className="p-4">
          <p className="text-3xl font-bold text-orange-400">{songsInProgress}</p>
          <p className="text-sm text-muted">Chansons en cours</p>
        </Card>
        <Card className="p-4">
          <p className="text-3xl font-bold text-emerald-400">{songsDone}</p>
          <p className="text-sm text-muted">Chansons terminées</p>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-serif text-lg font-semibold text-ink">Activité récente</h2>
          {activity.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Aucune activité pour l'instant" />
          ) : (
            <div className="space-y-2">
              {activity.map((item, i) =>
                item.kind === "assignment" ? (
                  <div key={i} className="rounded-lg bg-surface-raised px-3 py-2 text-sm">
                    <Link to={`/songs/${item.data.song_id}`} className="font-semibold text-ink hover:text-accent">
                      {item.data.song?.title ?? "Chanson"}
                    </Link>
                    <span className="text-muted"> — assignation mise à jour ({formatDate(item.at)})</span>
                  </div>
                ) : (
                  <div key={i} className="rounded-lg bg-surface-raised px-3 py-2 text-sm">
                    <Link to={`/songs/${item.data.song_id}`} className="font-semibold text-ink hover:text-accent">
                      {item.data.song?.title ?? "Chanson"}
                    </Link>
                    <span className="text-muted"> — commentaire : "{item.data.text}" ({formatDate(item.at)})</span>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 flex items-center gap-1.5 font-serif text-lg font-semibold text-ink">
            <Users size={18} />
            {group?.name ?? "Groupe"}
          </h2>
          {members.length === 0 ? (
            <EmptyState icon={Users} title="Aucun membre pour l'instant" />
          ) : (
            <div className="space-y-1.5">
              {members.map((m) => (
                <div key={m.profile_id} className="flex items-center justify-between rounded-lg bg-surface-raised px-3 py-2 text-sm">
                  <span className="text-ink">
                    {m.profile?.first_name} {m.profile?.last_name}
                  </span>
                  {m.part && <span className="text-xs text-muted">{m.part}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MemberDashboard({ userId }: { userId: string }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  function load() {
    setLoading(true);
    listAssignmentsForUser(userId)
      .then(setAssignments)
      .finally(() => setLoading(false));
  }

  useEffect(load, [userId]);

  async function handleStatusChange(id: string, status: Assignment["status"]) {
    try {
      await updateAssignmentStatus(id, status);
      setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      showToast("Statut mis à jour.", "success");
    } catch {
      showToast("Échec de la mise à jour.", "error");
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-ink sm:text-3xl">Mes assignations</h1>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Aucune assignation pour l'instant"
          description="Ton chef de chœur t'assignera des parties depuis la fiche d'une chanson."
        />
      ) : (
        <div className="space-y-2">
          {assignments.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              showSongTitle
              canEditStatus
              onStatusChange={(status) => handleStatusChange(a.id, status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const { profile } = useAuth();
  if (!profile) return null;
  const isChef = profile.role === "chef_choeur" || profile.role === "admin";
  return isChef ? <ChefDashboard /> : <MemberDashboard userId={profile.id} />;
}
