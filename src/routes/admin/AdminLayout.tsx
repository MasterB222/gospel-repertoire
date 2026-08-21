import { Outlet } from "react-router-dom";
import { AdminNav } from "../../components/layout/AdminNav";

export function AdminLayout() {
  return (
    <div>
      <AdminNav />
      <Outlet />
    </div>
  );
}
