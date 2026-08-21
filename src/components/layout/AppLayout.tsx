import { Outlet } from "react-router-dom";
import clsx from "clsx";
import { Sidebar } from "./Sidebar";
import { MobileNavbar } from "./MobileNavbar";
import { Header } from "./Header";
import { GlobalPlayer } from "../player/GlobalPlayer";
import { usePlayer } from "../../context/PlayerContext";

export function AppLayout() {
  const { currentSong } = usePlayer();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header />
        <main
          className={clsx(
            "min-w-0 flex-1 px-4 pt-4 sm:px-6",
            currentSong ? "pb-36 sm:pb-24" : "pb-20 sm:pb-6"
          )}
        >
          <Outlet />
        </main>
      </div>
      <MobileNavbar />
      <GlobalPlayer />
    </div>
  );
}
