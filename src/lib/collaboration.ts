import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import type { Assignment, AssignmentStatus, Comment, Group, GroupMember } from "../types/collaboration";

const ASSIGNMENT_SELECT =
  "*, song:songs(id,title), assignee_user:profiles!assignments_assignee_user_id_fkey(id,first_name,last_name), assignee_group:groups(id,name)";
const COMMENT_SELECT = "*, author:profiles(id,first_name,last_name)";
const MEMBER_SELECT = "*, profile:profiles(id,first_name,last_name)";

export async function listGroups(): Promise<Group[]> {
  const { data, error } = await supabase.from("groups").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function listGroupMembers(groupId: string): Promise<GroupMember[]> {
  const { data, error } = await supabase.from("group_members").select(MEMBER_SELECT).eq("group_id", groupId);
  if (error) throw error;
  return (data ?? []) as unknown as GroupMember[];
}

export async function searchProfiles(query: string): Promise<{ id: string; first_name: string; last_name: string }[]> {
  if (!query.trim()) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id,first_name,last_name")
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .limit(10);
  if (error) throw error;
  return data ?? [];
}

export async function addGroupMember(groupId: string, profileId: string, part: string): Promise<void> {
  const { error } = await supabase.from("group_members").insert({ group_id: groupId, profile_id: profileId, part });
  if (error) throw error;
}

export async function listAssignmentsForSong(songId: string): Promise<Assignment[]> {
  const { data, error } = await supabase
    .from("assignments")
    .select(ASSIGNMENT_SELECT)
    .eq("song_id", songId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Assignment[];
}

export async function listAssignmentsForUser(userId: string): Promise<Assignment[]> {
  const { data, error } = await supabase
    .from("assignments")
    .select(ASSIGNMENT_SELECT)
    .eq("assignee_user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Assignment[];
}

export async function listAllAssignments(): Promise<Assignment[]> {
  const { data, error } = await supabase
    .from("assignments")
    .select(ASSIGNMENT_SELECT)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Assignment[];
}

export interface NewAssignment {
  song_id: string;
  section_id: string | null;
  measure_number: number | null;
  assignee_group_id: string | null;
  assignee_user_id: string | null;
  part: string;
  created_by: string;
}

export async function createAssignment(input: NewAssignment): Promise<void> {
  const { error } = await supabase.from("assignments").insert(input);
  if (error) throw error;
}

export async function updateAssignmentStatus(id: string, status: AssignmentStatus): Promise<void> {
  const { error } = await supabase.from("assignments").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function listCommentsForSong(songId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select(COMMENT_SELECT)
    .eq("song_id", songId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Comment[];
}

export interface NewComment {
  song_id: string;
  section_id: string | null;
  measure_number: number | null;
  author_id: string;
  text: string;
}

export async function addComment(input: NewComment): Promise<void> {
  const { error } = await supabase.from("comments").insert(input);
  if (error) throw error;
}

export async function listRecentComments(limit = 10): Promise<(Comment & { song: { id: string; title: string } | null })[]> {
  const { data, error } = await supabase
    .from("comments")
    .select(`${COMMENT_SELECT}, song:songs(id,title)`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as (Comment & { song: { id: string; title: string } | null })[];
}

interface PresentUser {
  id: string;
  name: string;
}

/** Présence temps réel : qui d'autre a cette chanson ouverte dans l'éditeur. */
export function useSongPresence(songId: string | undefined, self: PresentUser | null) {
  const [present, setPresent] = useState<PresentUser[]>([]);

  useEffect(() => {
    if (!songId || !self) return;
    const channel = supabase.channel(`song-presence:${songId}`, { config: { presence: { key: self.id } } });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresentUser>();
        const users = Object.values(state)
          .flat()
          .map((u) => ({ id: u.id, name: u.name }));
        setPresent(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track(self);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [songId, self?.id, self?.name]);

  return present;
}
