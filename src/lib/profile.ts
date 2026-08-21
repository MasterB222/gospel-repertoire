import { supabase } from "./supabaseClient";
import type { Profile } from "../context/AuthContext";

export async function updateProfile(id: string, patch: Partial<Pick<Profile, "first_name" | "last_name" | "note_notation">>): Promise<void> {
  const { error } = await supabase.from("profiles").update(patch).eq("id", id);
  if (error) throw error;
}
