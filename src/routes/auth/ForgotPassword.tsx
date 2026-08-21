import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/ui/Button";
import { AuthLayout, FieldLabel, inputClasses } from "./AuthLayout";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <AuthLayout title="Mot de passe oublié" subtitle="Recevez un lien de réinitialisation par email.">
      {sent ? (
        <p className="text-sm text-ink">
          Si un compte existe pour <strong>{email}</strong>, un email de réinitialisation vient d'être envoyé.
        </p>
      ) : (
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
          {error && <p className="text-xs text-danger">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Envoi..." : "Envoyer le lien"}
          </Button>
        </form>
      )}

      <p className="mt-5 text-center text-xs text-muted">
        <Link to="/login" className="text-accent hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </AuthLayout>
  );
}
