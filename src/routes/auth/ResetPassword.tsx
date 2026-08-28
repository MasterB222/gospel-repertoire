import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { AuthLayout, FieldLabel, inputClasses } from "./AuthLayout";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export function ResetPassword() {
  useDocumentTitle("Nouveau mot de passe");
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Le lien de réinitialisation établit une session dès le chargement de la
    // page (avant même que ce composant ne s'abonne à onAuthStateChange) :
    // on vérifie donc aussi une session déjà active en filet de sécurité.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    showToast("Mot de passe mis à jour.", "success");
  }

  if (done) {
    return (
      <AuthLayout title="Mot de passe mis à jour" subtitle="Tu peux maintenant continuer avec ton nouveau mot de passe.">
        <Button className="w-full" onClick={() => navigate("/", { replace: true })}>
          Continuer
        </Button>
      </AuthLayout>
    );
  }

  if (!ready) {
    return (
      <AuthLayout title="Lien invalide ou expiré" subtitle="Ce lien de réinitialisation n'est plus valide.">
        <p className="text-sm text-ink">
          Demande un nouveau lien depuis la page{" "}
          <Link to="/forgot-password" className="text-accent-ink hover:underline">
            mot de passe oublié
          </Link>
          .
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Nouveau mot de passe" subtitle="Choisis un nouveau mot de passe pour ton compte.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel htmlFor="password">Nouveau mot de passe</FieldLabel>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <FieldLabel htmlFor="confirm">Confirmer le mot de passe</FieldLabel>
          <input
            id="confirm"
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClasses}
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
        </Button>
      </form>
    </AuthLayout>
  );
}
