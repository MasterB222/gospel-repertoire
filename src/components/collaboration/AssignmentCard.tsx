import { Link } from "react-router-dom";
import { Users, User } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { Assignment, AssignmentStatus } from "../../types/collaboration";

interface AssignmentCardProps {
  assignment: Assignment;
  showSongTitle?: boolean;
  canEditStatus: boolean;
  onStatusChange: (status: AssignmentStatus) => void;
}

export function AssignmentCard({ assignment, showSongTitle, canEditStatus, onStatusChange }: AssignmentCardProps) {
  const target = assignment.section_id
    ? assignment.measure_number != null
      ? `Mesure ${assignment.measure_number}`
      : `Section ${assignment.section_id}`
    : "Chanson entière";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface-raised px-3 py-2.5">
      <div className="min-w-0">
        {showSongTitle && assignment.song && (
          <Link to={`/songs/${assignment.song.id}`} className="text-sm font-semibold text-ink hover:text-accent">
            {assignment.song.title}
          </Link>
        )}
        <p className="text-xs text-muted">
          {target}
          {assignment.part && ` · ${assignment.part}`}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
          {assignment.assignee_group ? <Users size={12} /> : <User size={12} />}
          {assignment.assignee_group?.name ??
            (assignment.assignee_user ? `${assignment.assignee_user.first_name} ${assignment.assignee_user.last_name}` : "—")}
        </p>
      </div>

      <StatusBadge status={assignment.status} onChange={canEditStatus ? onStatusChange : undefined} />
    </div>
  );
}
