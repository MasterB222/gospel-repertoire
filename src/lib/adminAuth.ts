import { createClient } from "@supabase/supabase-js";
import type { UserRole } from "../context/AuthContext";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface NewUserInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface NewUserResult {
  needsEmailConfirmation: boolean;
}

/**
 * Crée un compte pour quelqu'un d'autre depuis l'admin, sans déconnecter la
 * session admin en cours : signUp() sur un client Supabase totalement isolé
 * (pas de session persistée, pas de storage partagé avec le client principal).
 */
export async function adminCreateUser(input: NewUserInput): Promise<NewUserResult> {
  const isolatedClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data, error } = await isolatedClient.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        first_name: input.first_name,
        last_name: input.last_name,
        role: input.role,
      },
    },
  });

  if (error) throw error;

  return { needsEmailConfirmation: !data.session };
}

export function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let result = "";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  for (const b of bytes) result += chars[b % chars.length];
  return result;
}
