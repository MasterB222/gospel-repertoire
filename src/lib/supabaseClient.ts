import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error(
    "Variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquantes. Copie .env.example vers .env et remplis-le."
  );
}

const REMEMBER_KEY = "gospel-remember-me";

/**
 * "Se souvenir de moi" décoché => session écrite en sessionStorage (perdue à la
 * fermeture du navigateur) plutôt qu'en localStorage. Le flag doit être posé
 * AVANT l'appel à signInWithPassword pour que ce storage l'utilise dès l'écriture
 * du token.
 */
export function setRememberMe(remember: boolean) {
  window.localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
}

const rememberAwareStorage = {
  getItem: (key: string) => window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key),
  setItem: (key: string, value: string) => {
    const remember = window.localStorage.getItem(REMEMBER_KEY) !== "0";
    if (remember) {
      window.localStorage.setItem(key, value);
      window.sessionStorage.removeItem(key);
    } else {
      window.sessionStorage.setItem(key, value);
      window.localStorage.removeItem(key);
    }
  },
  removeItem: (key: string) => {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

export const supabase = createClient(url, anonKey, {
  auth: { storage: rememberAwareStorage },
});
