import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase, setRememberMe as persistRememberMe } from "../../lib/supabaseClient";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { AuthLayout, FieldLabel, inputClasses } from "./AuthLayout";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export function Login() {
  useDocumentTitle("Connexion");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    persistRememberMe(rememberMe);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("active")
      .eq("id", signInData.user.id)
      .maybeSingle();
    setLoading(false);

    if (profileRow?.active === false) {
      await supabase.auth.signOut();
      setError("Ce compte a été désactivé. Contacte un responsable de ton groupe.");
      return;
    }

    showToast("Connexion réussie.", "success");
    navigate(redirectTo, { replace: true });
  }

  return (
    <AuthLayout title="Connexion admin" subtitle="Accédez à votre espace du répertoire gospel.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-muted">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-border"
            />
            Se souvenir de moi
          </label>
          <Link to="/forgot-password" className="text-accent-ink hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Connexion..." : "Se connecter"}
        </Button>

        <button
          type="button"
          disabled
          title="Bientôt disponible — provider Google à configurer côté Supabase"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-muted opacity-60"
        >
          Continuer avec Google
          <span className="rounded-full bg-surface px-2 py-0.5 text-[10px]">Bientôt disponible</span>
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-muted">
        Pas encore de compte ?{" "}
        <Link to="/register" className="text-accent-ink hover:underline">
          Inscrivez-vous
        </Link>
      </p>
    </AuthLayout>
  );
}
