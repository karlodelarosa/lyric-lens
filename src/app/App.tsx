"use client";

import { RouterProvider } from "react-router";
import { AuthProvider } from "@frontend/contexts/AuthContext";
import { OrganizationProvider } from "@frontend/contexts/OrganizationContext";
import { AppProvider } from "./contexts/AppContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { OrgThemeEffect } from "./components/OrgThemeEffect";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OrganizationProvider>
          <OrgThemeEffect />
          <AppProvider>
            <RouterProvider router={router} />
            <Toaster />
          </AppProvider>
        </OrganizationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
