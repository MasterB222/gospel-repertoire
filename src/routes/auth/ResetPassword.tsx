import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { AuthLayout, FieldLabel, inputClasses } from "./AuthLayout";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export function ResetPassword() {
  const { t } = useTranslation("auth");
  useDocumentTitle(t("resetPassword.documentTitle"));
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
      setError(t("resetPassword.errors.tooShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("resetPassword.errors.mismatch"));
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
    showToast(t("resetPassword.success"), "success");
  }

  if (done) {
    return (
      <AuthLayout title={t("resetPassword.doneTitle")} subtitle={t("resetPassword.doneSubtitle")}>
        <Button className="w-full" onClick={() => navigate("/", { replace: true })}>
          {t("resetPassword.continueButton")}
        </Button>
      </AuthLayout>
    );
  }

  if (!ready) {
    return (
      <AuthLayout title={t("resetPassword.invalidTitle")} subtitle={t("resetPassword.invalidSubtitle")}>
        <p className="text-sm text-ink">
          <Trans
            t={t}
            i18nKey="resetPassword.expiredMessage"
            components={{ 1: <Link to="/forgot-password" className="text-accent-ink hover:underline" /> }}
          />
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t("resetPassword.title")} subtitle={t("resetPassword.subtitle")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel htmlFor="password">{t("resetPassword.newPasswordLabel")}</FieldLabel>
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
          <FieldLabel htmlFor="confirm">{t("resetPassword.confirmPasswordLabel")}</FieldLabel>
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
          {loading ? t("resetPassword.submitLoading") : t("resetPassword.submit")}
        </Button>
      </form>
    </AuthLayout>
  );
}
