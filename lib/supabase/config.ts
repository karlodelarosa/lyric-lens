function formatMissingEnvMessage(kind: "url" | "key", tried: string[]) {
  const hint =
    kind === "url"
      ? "Set NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co (Supabase Dashboard → Project Settings → API → Project URL)."
      : "Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY (same API screen).";

  return [
    `Missing Supabase ${kind === "url" ? "URL" : "publishable/anon key"}.`,
    `Tried: ${tried.join(", ")}.`,
    "Copy `.env.example` to `.env.local`, fill real values, then restart `npm run dev`.",
    hint,
  ].join(" ");
}

function getFirstEnv(kind: "url" | "key", names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value) {
      return value;
    }
  }

  throw new Error(formatMissingEnvMessage(kind, names));
}

function tryGetFirstEnv(names: string[]): string | null {
  for (const name of names) {
    const value = process.env[name];
    if (value) {
      return value;
    }
  }
  return null;
}

const SUPABASE_URL_ENV_NAMES = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_URL",
  "PUBLIC_SUPABASE_URL",
];

const SUPABASE_KEY_ENV_NAMES = [
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_ANON_KEY",
  "PUBLIC_SUPABASE_PUBLISHABLE_KEY",
];

export function getSupabaseConfig() {
  const supabaseUrl = getFirstEnv("url", SUPABASE_URL_ENV_NAMES);
  const supabasePublishableKey = getFirstEnv("key", SUPABASE_KEY_ENV_NAMES);

  return { supabaseUrl, supabasePublishableKey };
}

export function tryGetSupabaseConfig() {
  const supabaseUrl = tryGetFirstEnv(SUPABASE_URL_ENV_NAMES);
  const supabasePublishableKey = tryGetFirstEnv(SUPABASE_KEY_ENV_NAMES);

  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  return { supabaseUrl, supabasePublishableKey };
}
