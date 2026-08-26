import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArtisticBackdrop } from "../../components/brand/ArtisticBackdrop";
import { Logo } from "../../components/brand/Logo";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      {/* ArtisticBackdrop reste sombre dans les deux thèmes : couleurs de texte
          fixes ici, pas les jetons de thème (sinon illisible en mode clair). */}
      <ArtisticBackdrop className="hidden md:flex md:w-1/2 lg:w-3/5">
        <div className="flex h-full flex-col justify-between p-10 lg:p-14">
          <Link to="/" className="flex w-fit items-center gap-2.5">
            <Logo className="h-9 w-9" />
            <span className="font-serif text-lg font-semibold text-[#F6E9DC]">Gospel Répertoire</span>
          </Link>
          <div className="max-w-md">
            <h2 className="font-serif text-3xl font-semibold leading-tight text-[#F6E9DC] lg:text-4xl">
              Un répertoire vivant, pensé pour chanter ensemble.
            </h2>
            <p className="mt-3 text-sm text-[#F6E9DC]/75">
              Structurez vos chansons, assignez les parties, suivez l'apprentissage du groupe — tout au même
              endroit.
            </p>
          </div>
        </div>
      </ArtisticBackdrop>

      <ArtisticBackdrop className="flex h-36 items-end p-6 md:hidden">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <span className="font-serif text-base font-semibold text-[#F6E9DC]">Gospel Répertoire</span>
        </Link>
      </ArtisticBackdrop>

      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 md:w-1/2 lg:w-2/5">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-2xl font-semibold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-muted">
      {children}
    </label>
  );
}

export const inputClasses =
  "w-full rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
