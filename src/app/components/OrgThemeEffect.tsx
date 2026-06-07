import { useEffect } from "react";
import { useOrganization } from "@frontend/contexts/OrganizationContext";
import {
  ORG_THEME_PRESETS,
  resolveOrgThemePresetId,
} from "@backend/domain/organization/orgThemePresets";
import { useTheme } from "../contexts/ThemeContext";

const THEME_CSS_VARS = [
  "--primary",
  "--primary-foreground",
  "--ring",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--sidebar-ring",
] as const;

export function OrgThemeEffect() {
  const { activeOrganization } = useOrganization();
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    const presetId = resolveOrgThemePresetId(activeOrganization?.themePreset);
    const preset = ORG_THEME_PRESETS[presetId];
    const colors = theme === "dark" ? preset.dark : preset.light;

    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--primary-foreground", colors.primaryForeground);
    root.style.setProperty("--ring", colors.ring);
    root.style.setProperty("--sidebar-primary", colors.sidebarPrimary);
    root.style.setProperty(
      "--sidebar-primary-foreground",
      colors.sidebarPrimaryForeground,
    );
    root.style.setProperty("--sidebar-ring", colors.sidebarRing);

    return () => {
      for (const cssVar of THEME_CSS_VARS) {
        root.style.removeProperty(cssVar);
      }
    };
  }, [activeOrganization?.themePreset, theme]);

  return null;
}
