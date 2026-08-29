import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { useToast } from "./ToastContext";

export type UserRole = "admin" | "chef_choeur" | "musicien" | "chanteur" | "choriste" | "utilisateur";

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  note_notation: "solfege" | "letters";
  active: boolean;
  avatar_url: string | null;
}

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const VALID_ROLES: UserRole[] = ["admin", "chef_choeur", "musicien", "chanteur", "choriste", "utilisateur"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(
    async (user: User) => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (error) {
        console.error("Erreur de chargement du profil", error);
        setProfile(null);
        return;
      }

      let resolved = data;
      if (!resolved) {
        // Compte authentifié sans ligne `profiles` (ex. trigger de création non
        // déclenché à l'inscription) : on la crée maintenant, avec les métadonnées
        // du compte si disponibles, sinon des valeurs par défaut.
        const metaRole = user.user_metadata?.role;
        const role = VALID_ROLES.includes(metaRole) ? metaRole : "utilisateur";
        const { data: created, error: createError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            first_name: user.user_metadata?.first_name ?? "",
            last_name: user.user_metadata?.last_name ?? "",
            role,
          })
          .select("*")
          .single();

        if (createError) {
          console.error("Erreur de création du profil manquant", createError);
          setProfile(null);
          return;
        }
        resolved = created;
      }

      if (resolved.active === false) {
        showToast("Ce compte a été désactivé par un administrateur.", "error");
        await supabase.auth.signOut();
        setProfile(null);
        return;
      }

      setProfile(resolved);
    },
    [showToast]
  );

  const refreshProfile = useCallback(async () => {
    if (session) await loadProfile(session.user);
  }, [session, loadProfile]);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!active) return;
      setSession(initialSession);
      if (initialSession) loadProfile(initialSession.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        loadProfile(newSession.user);
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  return (
    <AuthContext.Provider value={{ session, profile, loading, isAuthenticated: !!session, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
