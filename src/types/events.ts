export type EventType = "repetition" | "concert" | "culte" | "autre";
export type EventStatus = "brouillon" | "publie" | "termine" | "annule";
export type ChecklistStatus = "a_faire" | "en_cours" | "fait";

export interface AppEvent {
  id: string;
  name: string;
  description: string;
  event_date: string;
  location: string;
  type: EventType;
  cover_url: string;
  status: EventStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventProgramItem {
  id: string;
  event_id: string;
  song_id: string;
  position: number;
  key_signature: string;
  stage_notes: string;
  song?: { id: string; title: string; original_key: string } | null;
}

export interface ChecklistItem {
  id: string;
  event_id: string;
  item: string;
  assigned_to: string | null;
  status: ChecklistStatus;
  due_date: string | null;
  created_at: string;
  assignee?: { id: string; first_name: string; last_name: string } | null;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  repetition: "Répétition",
  concert: "Concert",
  culte: "Culte",
  autre: "Autre",
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  brouillon: "Brouillon",
  publie: "Publié",
  termine: "Terminé",
  annule: "Annulé",
};

export const CHECKLIST_STATUS_LABELS: Record<ChecklistStatus, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  fait: "Fait",
};
