import { supabase } from "./supabaseClient";
import type { AppEvent, ChecklistItem, ChecklistStatus, EventProgramItem, EventStatus, EventType } from "../types/events";

const PROGRAM_SELECT = "*, song:songs(id,title,original_key)";
const CHECKLIST_SELECT = "*, assignee:profiles(id,first_name,last_name)";

export async function listEvents(): Promise<AppEvent[]> {
  const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getEvent(id: string): Promise<AppEvent | null> {
  const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export interface EventInput {
  name: string;
  description: string;
  event_date: string;
  location: string;
  type: EventType;
  cover_url: string;
  status: EventStatus;
}

export async function createEvent(input: EventInput): Promise<AppEvent> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("events")
    .insert({ ...input, created_by: user?.id ?? null })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateEvent(id: string, input: Partial<EventInput>): Promise<void> {
  const { error } = await supabase.from("events").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}

export async function listEventProgram(eventId: string): Promise<EventProgramItem[]> {
  const { data, error } = await supabase
    .from("event_program")
    .select(PROGRAM_SELECT)
    .eq("event_id", eventId)
    .order("position");
  if (error) throw error;
  return (data ?? []) as unknown as EventProgramItem[];
}

export async function addSongToProgram(eventId: string, songId: string, position: number): Promise<void> {
  const { error } = await supabase.from("event_program").insert({ event_id: eventId, song_id: songId, position });
  if (error) throw error;
}

export async function removeSongFromProgram(programItemId: string): Promise<void> {
  const { error } = await supabase.from("event_program").delete().eq("id", programItemId);
  if (error) throw error;
}

export async function updateProgramItem(
  programItemId: string,
  patch: Partial<Pick<EventProgramItem, "key_signature" | "stage_notes" | "position">>
): Promise<void> {
  const { error } = await supabase.from("event_program").update(patch).eq("id", programItemId);
  if (error) throw error;
}

export async function listChecklist(eventId: string): Promise<ChecklistItem[]> {
  const { data, error } = await supabase
    .from("event_checklist")
    .select(CHECKLIST_SELECT)
    .eq("event_id", eventId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as unknown as ChecklistItem[];
}

export async function addChecklistItem(eventId: string, item: string, assignedTo: string | null): Promise<void> {
  const { error } = await supabase.from("event_checklist").insert({ event_id: eventId, item, assigned_to: assignedTo });
  if (error) throw error;
}

export async function updateChecklistItemStatus(itemId: string, status: ChecklistStatus): Promise<void> {
  const { error } = await supabase.from("event_checklist").update({ status }).eq("id", itemId);
  if (error) throw error;
}

export async function deleteChecklistItem(itemId: string): Promise<void> {
  const { error } = await supabase.from("event_checklist").delete().eq("id", itemId);
  if (error) throw error;
}
