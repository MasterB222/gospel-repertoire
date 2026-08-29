import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { EmptyState } from "../components/ui/EmptyState";
import { ShieldAlert } from "lucide-react";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { t } = useTranslation(["pages", "common"]);
  const { isAuthenticated, loading, profile } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (profile?.role !== "admin") {
    return (
      <div className="p-6">
        <EmptyState
          icon={ShieldAlert}
          title={t("requireAdmin.title")}
          description={t("requireAdmin.description", { role: t("roles.admin", { ns: "common" }) })}
        />
      </div>
    );
  }

  return <>{children}</>;
}
