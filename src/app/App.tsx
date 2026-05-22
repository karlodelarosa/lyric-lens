"use client";

import { RouterProvider } from "react-router";
import { AuthProvider } from "@frontend/contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
