import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNavbar } from "./MobileNavbar";
import { Header } from "./Header";

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header />
        <main className="flex-1 px-4 pb-20 pt-4 sm:px-6 sm:pb-6">
          <Outlet />
        </main>
      </div>
      <MobileNavbar />
    </div>
  );
}
