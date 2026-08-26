import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { AuthLayout, FieldLabel, inputClasses } from "./AuthLayout";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

const ROLES = [
  { value: "chanteur", label: "Chanteur" },
  { value: "musicien", label: "Musicien" },
  { value: "choriste", label: "Choriste" },
  { value: "chef_choeur", label: "Chef de chœur" },
  { value: "admin", label: "Responsable" },
  { value: "utilisateur", label: "Simple utilisateur" },
] as const;

export function Register() {
  useDocumentTitle("Inscription");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]["value"]>("chanteur");
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
    showToast("Compte créé. Vérifiez votre email si une confirmation est requise.", "success");
    navigate("/", { replace: true });
  }

  return (
    <AuthLayout title="Créer un compte" subtitle="Rejoignez le répertoire gospel du groupe.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="firstName">Prénom</FieldLabel>
            <input
              id="firstName"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <FieldLabel htmlFor="lastName">Nom</FieldLabel>
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <FieldLabel htmlFor="role">Rôle déclaré</FieldLabel>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            className={inputClasses}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Création..." : "Créer mon compte"}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-muted">
        Déjà un compte ?{" "}
        <Link to="/login" className="text-accent-ink hover:underline">
          Connectez-vous
        </Link>
      </p>
    </AuthLayout>
  );
}
