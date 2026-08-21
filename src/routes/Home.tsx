import { Link } from "react-router-dom";
import { ArrowRight, LogIn } from "lucide-react";
import { ArtisticBackdrop } from "../components/brand/ArtisticBackdrop";
import { useAuth } from "../context/AuthContext";

export function Home() {
  const { isAuthenticated, profile } = useAuth();

  return (
    <div className="mx-auto max-w-5xl">
      <ArtisticBackdrop className="rounded-3xl">
        <div className="flex min-h-[360px] flex-col justify-end gap-4 px-6 py-10 sm:px-10 sm:py-14 md:min-h-[420px]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Atelier musical gospel</p>
          <h1 className="max-w-xl font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            {isAuthenticated ? `Bienvenue, ${profile?.first_name ?? ""}` : "Le répertoire gospel de votre groupe"}
          </h1>
          <p className="max-w-lg text-sm text-ink/80 sm:text-base">
            Créez, structurez et répétez vos chansons ensemble — paroles, accords, notes et assignations, du
            premier brouillon à la présentation sur scène.
          </p>

          {!isAuthenticated && (
            <div className="mt-2 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-[#2A0F1E] shadow-[0_8px_24px_-8px_rgba(212,169,74,0.6)] transition-colors hover:bg-accent-soft"
              >
                Créer un compte
                <ArrowRight size={16} strokeWidth={2} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-ink backdrop-blur-glass transition-colors hover:bg-white/10"
              >
                <LogIn size={16} strokeWidth={2} />
                Connexion
              </Link>
            </div>
          )}
        </div>
      </ArtisticBackdrop>
    </div>
  );
}
