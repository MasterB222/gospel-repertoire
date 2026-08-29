import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase, setRememberMe as persistRememberMe } from "../../lib/supabaseClient";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { AuthLayout, FieldLabel, inputClasses } from "./AuthLayout";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export function Login() {
  const { t } = useTranslation("auth");
  useDocumentTitle(t("login.documentTitle"));
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
      setError(t("login.errors.accountDisabled"));
      return;
    }

    showToast(t("login.success"), "success");
    navigate(redirectTo, { replace: true });
  }

  return (
    <AuthLayout title={t("login.title")} subtitle={t("login.subtitle")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel htmlFor="email">{t("login.emailLabel")}</FieldLabel>
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
          <FieldLabel htmlFor="password">{t("login.passwordLabel")}</FieldLabel>
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
            {t("login.rememberMe")}
          </label>
          <Link to="/forgot-password" className="text-accent-ink hover:underline">
            {t("login.forgotPasswordLink")}
          </Link>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t("login.submitLoading") : t("login.submit")}
        </Button>

        <button
          type="button"
          disabled
          title={t("login.googleComingSoonTitle")}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-muted opacity-60"
        >
          {t("login.googleButton")}
          <span className="rounded-full bg-surface px-2 py-0.5 text-[10px]">{t("login.comingSoonBadge")}</span>
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-muted">
        {t("login.noAccountPrefix")}{" "}
        <Link to="/register" className="text-accent-ink hover:underline">
          {t("login.registerLink")}
        </Link>
      </p>
    </AuthLayout>
  );
}
