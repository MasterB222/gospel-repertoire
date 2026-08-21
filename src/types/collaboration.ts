export type AssignmentStatus = "a_faire" | "en_cours" | "termine" | "a_revoir";

export interface Group {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  profile_id: string;
  part: string;
  joined_at: string;
  profile: { id: string; first_name: string; last_name: string } | null;
}

export interface Assignment {
  id: string;
  song_id: string;
  section_id: string | null;
  measure_number: number | null;
  assignee_group_id: string | null;
  assignee_user_id: string | null;
  part: string;
  status: AssignmentStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  song: { id: string; title: string } | null;
  assignee_user: { id: string; first_name: string; last_name: string } | null;
  assignee_group: { id: string; name: string } | null;
}

export interface Comment {
  id: string;
  song_id: string;
  section_id: string | null;
  measure_number: number | null;
  author_id: string | null;
  text: string;
  created_at: string;
  author: { id: string; first_name: string; last_name: string } | null;
}

export const STATUS_META: Record<AssignmentStatus, { emoji: string; label: string; color: string }> = {
  a_faire: { emoji: "⚪", label: "À faire", color: "text-muted" },
  en_cours: { emoji: "🟠", label: "En cours", color: "text-orange-400" },
  termine: { emoji: "🟢", label: "Terminé", color: "text-emerald-400" },
  a_revoir: { emoji: "🔴", label: "À revoir", color: "text-danger" },
};
