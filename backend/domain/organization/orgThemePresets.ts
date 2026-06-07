export const ORG_THEME_PRESET_IDS = [
  "purple",
  "blue",
  "emerald",
  "rose",
  "amber",
  "slate",
] as const;

export type OrgThemePresetId = (typeof ORG_THEME_PRESET_IDS)[number];

export type OrgThemeColors = {
  primary: string;
  primaryForeground: string;
  ring: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarRing: string;
};

export type OrgThemePreset = {
  label: string;
  swatch: string;
  light: OrgThemeColors;
  dark: OrgThemeColors;
};

export const ORG_THEME_PRESETS: Record<OrgThemePresetId, OrgThemePreset> = {
  purple: {
    label: "Purple",
    swatch: "#7c3aed",
    light: {
      primary: "#7c3aed",
      primaryForeground: "#ffffff",
      ring: "#7c3aed",
      sidebarPrimary: "#7c3aed",
      sidebarPrimaryForeground: "#fafafa",
      sidebarRing: "#7c3aed",
    },
    dark: {
      primary: "#a78bfa",
      primaryForeground: "#18181b",
      ring: "#a78bfa",
      sidebarPrimary: "#a78bfa",
      sidebarPrimaryForeground: "#18181b",
      sidebarRing: "#a78bfa",
    },
  },
  blue: {
    label: "Blue",
    swatch: "#2563eb",
    light: {
      primary: "#2563eb",
      primaryForeground: "#ffffff",
      ring: "#2563eb",
      sidebarPrimary: "#2563eb",
      sidebarPrimaryForeground: "#fafafa",
      sidebarRing: "#2563eb",
    },
    dark: {
      primary: "#60a5fa",
      primaryForeground: "#18181b",
      ring: "#60a5fa",
      sidebarPrimary: "#60a5fa",
      sidebarPrimaryForeground: "#18181b",
      sidebarRing: "#60a5fa",
    },
  },
  emerald: {
    label: "Emerald",
    swatch: "#059669",
    light: {
      primary: "#059669",
      primaryForeground: "#ffffff",
      ring: "#059669",
      sidebarPrimary: "#059669",
      sidebarPrimaryForeground: "#fafafa",
      sidebarRing: "#059669",
    },
    dark: {
      primary: "#34d399",
      primaryForeground: "#18181b",
      ring: "#34d399",
      sidebarPrimary: "#34d399",
      sidebarPrimaryForeground: "#18181b",
      sidebarRing: "#34d399",
    },
  },
  rose: {
    label: "Rose",
    swatch: "#e11d48",
    light: {
      primary: "#e11d48",
      primaryForeground: "#ffffff",
      ring: "#e11d48",
      sidebarPrimary: "#e11d48",
      sidebarPrimaryForeground: "#fafafa",
      sidebarRing: "#e11d48",
    },
    dark: {
      primary: "#fb7185",
      primaryForeground: "#18181b",
      ring: "#fb7185",
      sidebarPrimary: "#fb7185",
      sidebarPrimaryForeground: "#18181b",
      sidebarRing: "#fb7185",
    },
  },
  amber: {
    label: "Amber",
    swatch: "#d97706",
    light: {
      primary: "#d97706",
      primaryForeground: "#ffffff",
      ring: "#d97706",
      sidebarPrimary: "#d97706",
      sidebarPrimaryForeground: "#fafafa",
      sidebarRing: "#d97706",
    },
    dark: {
      primary: "#fbbf24",
      primaryForeground: "#18181b",
      ring: "#fbbf24",
      sidebarPrimary: "#fbbf24",
      sidebarPrimaryForeground: "#18181b",
      sidebarRing: "#fbbf24",
    },
  },
  slate: {
    label: "Slate",
    swatch: "#475569",
    light: {
      primary: "#475569",
      primaryForeground: "#ffffff",
      ring: "#475569",
      sidebarPrimary: "#475569",
      sidebarPrimaryForeground: "#fafafa",
      sidebarRing: "#475569",
    },
    dark: {
      primary: "#94a3b8",
      primaryForeground: "#18181b",
      ring: "#94a3b8",
      sidebarPrimary: "#94a3b8",
      sidebarPrimaryForeground: "#18181b",
      sidebarRing: "#94a3b8",
    },
  },
};

export function isOrgThemePresetId(value: string): value is OrgThemePresetId {
  return (ORG_THEME_PRESET_IDS as readonly string[]).includes(value);
}

export function resolveOrgThemePresetId(
  value: string | null | undefined,
): OrgThemePresetId {
  if (value && isOrgThemePresetId(value)) {
    return value;
  }
  return "purple";
}
