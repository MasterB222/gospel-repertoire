import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { AuthLayout, FieldLabel, inputClasses } from "./AuthLayout";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

const ROLE_VALUES = ["chanteur", "musicien", "choriste", "chef_choeur", "admin", "utilisateur"] as const;

export function Register() {
  const { t } = useTranslation("auth");
  useDocumentTitle(t("register.documentTitle"));
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof ROLE_VALUES)[number]>("chanteur");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { first_name: firstName, last_name: lastName, role },
      },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    showToast(t("register.success"), "success");
    navigate("/", { replace: true });
  }

  return (
    <AuthLayout title={t("register.title")} subtitle={t("register.subtitle")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="firstName">{t("register.firstNameLabel")}</FieldLabel>
            <input
              id="firstName"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <FieldLabel htmlFor="lastName">{t("register.lastNameLabel")}</FieldLabel>
            <input
              id="lastName"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="email">{t("register.emailLabel")}</FieldLabel>
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
          <FieldLabel htmlFor="password">{t("register.passwordLabel")}</FieldLabel>
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
          <FieldLabel htmlFor="role">{t("register.roleLabel")}</FieldLabel>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            className={inputClasses}
          >
            {ROLE_VALUES.map((r) => (
              <option key={r} value={r}>
                {t(`register.roles.${r}`)}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t("register.submitLoading") : t("register.submit")}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-muted">
        {t("register.alreadyAccountPrefix")}{" "}
        <Link to="/login" className="text-accent-ink hover:underline">
          {t("register.loginLink")}
        </Link>
      </p>
    </AuthLayout>
  );
}
