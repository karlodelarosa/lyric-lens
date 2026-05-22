function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getSupabaseUrl(): string {
  return (
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    requireEnv("SUPABASE_URL")
  );
}

export function getSupabasePublishableKey(): string {
  return (
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    requireEnv("SUPABASE_PUBLISHABLE_KEY")
  );
}

export function getProjectRef(): string {
  const url = getSupabaseUrl();
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1] ?? "unknown";
}
