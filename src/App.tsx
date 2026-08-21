import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { PlayerProvider } from "./context/PlayerContext";
import { FavoritesProvider } from "./context/FavoritesContext";

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <FavoritesProvider>
            <PlayerProvider>
              <RouterProvider router={router} />
            </PlayerProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
