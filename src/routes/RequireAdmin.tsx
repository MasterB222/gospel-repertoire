import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { EmptyState } from "../components/ui/EmptyState";
import { ShieldAlert } from "lucide-react";

export function RequireAdmin({ children }: { children: ReactNode }) {
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
          title="Accès réservé aux administrateurs"
          description="Cette section n'est accessible qu'aux comptes ayant le rôle Responsable."
        />
      </div>
    );
  }

  return <>{children}</>;
}
