import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";
import type { UserRole } from "./AuthContext";

interface OnlineUser {
  id: string;
  name: string;
  role: UserRole;
}

const PresenceContext = createContext<OnlineUser[]>([]);

/**
 * Rejoint un canal de présence global tant qu'un utilisateur est connecté,
 * pour que le dashboard admin puisse voir qui est en ligne — indépendant de
 * la présence par chanson déjà en place dans l'éditeur (PlayerContext).
 */
export function PresenceProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!profile) {
      setOnlineUsers([]);
      return;
    }

    const self: OnlineUser = {
      id: profile.id,
      name: `${profile.first_name} ${profile.last_name}`.trim() || "Anonyme",
      role: profile.role,
    };

    const channel = supabase.channel("app-presence", { config: { presence: { key: self.id } } });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<OnlineUser>();
        const byId = new Map<string, OnlineUser>();
        Object.values(state)
          .flat()
          .forEach((u) => byId.set(u.id, { id: u.id, name: u.name, role: u.role }));
        setOnlineUsers(Array.from(byId.values()));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track(self);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  return <PresenceContext.Provider value={onlineUsers}>{children}</PresenceContext.Provider>;
}

export function useOnlineUsers() {
  return useContext(PresenceContext);
}
