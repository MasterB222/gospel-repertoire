import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Users, Plus, Copy, Check, UserX, UserCheck, Trash2, RefreshCw, KeyRound } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAuth, type UserRole } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { listAllProfiles, updateUserRole, setUserActive, deleteUserAccount, type AdminProfile } from "../../lib/admin";
import { adminCreateUser, generatePassword } from "../../lib/adminAuth";

const ROLES: UserRole[] = ["admin", "chef_choeur", "musicien", "chanteur", "choriste", "utilisateur"];

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const fieldClasses =
  "w-full rounded-lg border border-border bg-surface-raised px-2.5 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

interface CreatedCredentials {
  email: string;
  password: string;
  needsEmailConfirmation: boolean;
}

function CreateUserForm({
  onCreated,
  onCancel,
}: {
  onCreated: (creds: CreatedCredentials) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation(["admin", "common"]);
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(generatePassword());
  const [role, setRole] = useState<UserRole>("chanteur");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    const trimmedEmail = email.trim();
    if (!firstName.trim() || !lastName.trim() || !trimmedEmail || password.length < 6) {
      showToast(t("users.fillAllFields"), "error");
      return;
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      showToast(
        // eslint-disable-next-line no-control-regex
        /[^\x00-\x7F]/.test(trimmedEmail) ? t("users.stylizedEmail") : t("users.invalidEmail"),
        "error"
      );
      return;
    }
    setSaving(true);
    try {
      const result = await adminCreateUser({
        email: trimmedEmail,
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role,
      });
      onCreated({ email: trimmedEmail, password, needsEmailConfirmation: result.needsEmailConfirmation });
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword(generatePassword());
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      showToast(message.toLowerCase().includes("invalid format") ? t("users.invalidEmail") : message || t("users.createFailed"), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mb-4 space-y-3 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={t("users.firstNamePlaceholder")} className={fieldClasses} />
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={t("users.lastNamePlaceholder")} className={fieldClasses} />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("users.emailPlaceholder")}
          className={fieldClasses}
        />
        <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className={fieldClasses}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {t(`roles.${r}`, { ns: "common" })}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <input value={password} onChange={(e) => setPassword(e.target.value)} className={fieldClasses} />
        <button
          type="button"
          onClick={() => setPassword(generatePassword())}
          title={t("users.generatePasswordTitle")}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 text-xs text-ink hover:border-accent"
        >
          <RefreshCw size={13} />
          {t("users.generate")}
        </button>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={saving}>
          <KeyRound size={15} />
          {saving ? t("users.creating") : t("users.create")}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-border px-4 text-sm text-ink hover:border-accent disabled:opacity-50"
        >
          {t("users.cancel")}
        </button>
      </div>
    </Card>
  );
}

function CredentialsPanel({ creds, onClose }: { creds: CreatedCredentials; onClose: () => void }) {
  const { t } = useTranslation("admin");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(`${t("users.copyEmailLabel")} : ${creds.email}\n${t("users.copyPasswordLabel")} : ${creds.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="mb-4 space-y-2 border-accent/40 bg-accent/5 p-4">
      <p className="text-sm font-semibold text-ink">{t("users.credentialsTitle")}</p>
      <p className="font-mono text-sm text-ink">
        {creds.email} / {creds.password}
      </p>
      {creds.needsEmailConfirmation && <p className="text-xs text-muted">{t("users.confirmationNotice")}</p>}
      <div className="flex gap-2 pt-1">
        <Button variant="secondary" onClick={handleCopy}>
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? t("users.copied") : t("users.copy")}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          {t("users.close")}
        </Button>
      </div>
    </Card>
  );
}

export function AdminUsers() {
  const { t } = useTranslation(["admin", "common"]);
  const { profile: currentProfile } = useAuth();
  const { showToast } = useToast();
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<CreatedCredentials | null>(null);

  function load() {
    setLoading(true);
    listAllProfiles()
      .then(setProfiles)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleRoleChange(id: string, role: UserRole) {
    const previous = profiles;
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, role } : p)));
    try {
      await updateUserRole(id, role);
      showToast(t("users.roleUpdated"), "success");
    } catch {
      setProfiles(previous);
      showToast(t("users.roleUpdateFailed"), "error");
    }
  }

  async function handleToggleActive(id: string, active: boolean) {
    const previous = profiles;
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, active } : p)));
    try {
      await setUserActive(id, active);
      showToast(active ? t("users.accountReactivated") : t("users.accountDeactivated"), "success");
    } catch {
      setProfiles(previous);
      showToast(t("users.updateFailed"), "error");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(t("users.deleteConfirm", { name }))) return;
    try {
      await deleteUserAccount(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      showToast(t("users.accountDeleted"), "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("users.deleteFailed"), "error");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{t("users.title")}</h1>
        {!showCreateForm && (
          <Button
            onClick={() => {
              setShowCreateForm(true);
              setCreatedCreds(null);
            }}
          >
            <Plus size={15} />
            {t("users.new")}
          </Button>
        )}
      </div>

      <div className="max-w-2xl">
        {showCreateForm && (
          <CreateUserForm
            onCreated={(creds) => {
              setCreatedCreds(creds);
              setShowCreateForm(false);
              load();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        )}
        {createdCreds && <CredentialsPanel creds={createdCreds} onClose={() => setCreatedCreds(null)} />}
      </div>

      {loading ? (
        <Skeleton className="h-60 w-full max-w-2xl" />
      ) : profiles.length === 0 ? (
        <EmptyState icon={Users} title={t("users.empty")} />
      ) : (
        <div className="max-w-2xl space-y-2">
          {profiles.map((p) => {
            const isSelf = p.id === currentProfile?.id;
            return (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-raised px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {p.first_name} {p.last_name}
                    {!p.active && <span className="ml-2 rounded-full bg-danger/15 px-2 py-0.5 text-[10px] text-danger">{t("users.disabled")}</span>}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={p.role}
                    disabled={isSelf}
                    onChange={(e) => handleRoleChange(p.id, e.target.value as UserRole)}
                    className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-ink focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {t(`roles.${r}`, { ns: "common" })}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleToggleActive(p.id, !p.active)}
                    disabled={isSelf}
                    title={p.active ? t("users.deactivate") : t("users.reactivate")}
                    className="rounded-lg p-1.5 text-muted hover:text-ink disabled:opacity-30"
                  >
                    {p.active ? <UserX size={15} /> : <UserCheck size={15} />}
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, `${p.first_name} ${p.last_name}`)}
                    disabled={isSelf}
                    title={t("users.deleteForever")}
                    className="rounded-lg p-1.5 text-muted hover:text-danger disabled:opacity-30"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
