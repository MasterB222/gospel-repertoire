import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/ui/Button";
import { AuthLayout, FieldLabel, inputClasses } from "./AuthLayout";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export function ForgotPassword() {
  const { t } = useTranslation("auth");
  useDocumentTitle(t("forgotPassword.documentTitle"));
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <AuthLayout title={t("forgotPassword.title")} subtitle={t("forgotPassword.subtitle")}>
      {sent ? (
        <p className="text-sm text-ink">
          <Trans t={t} i18nKey="forgotPassword.sentMessage" values={{ email }} components={{ 1: <strong /> }} />
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <FieldLabel htmlFor="email">{t("forgotPassword.emailLabel")}</FieldLabel>
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
            {loading ? t("forgotPassword.submitLoading") : t("forgotPassword.submit")}
          </Button>
        </form>
      )}

      <p className="mt-5 text-center text-xs text-muted">
        <Link to="/login" className="text-accent-ink hover:underline">
          {t("forgotPassword.backToLogin")}
        </Link>
      </p>
    </AuthLayout>
  );
}
