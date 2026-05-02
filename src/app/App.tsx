"use client";

import { RouterProvider } from "react-router";
import { PasswordRecoveryDialog } from "./components/auth/PasswordRecoveryDialog";
import { AppProvider } from "./contexts/AppContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <PasswordRecoveryDialog />
        <RouterProvider router={router} />
        <Toaster />
      </AppProvider>
    </ThemeProvider>
  );
}
