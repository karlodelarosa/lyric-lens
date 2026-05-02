export async function register() {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const { tryGetSupabaseConfig } = await import("./lib/supabase/config");

  if (!tryGetSupabaseConfig()) {
    console.warn(
      "[lyric-lens] Supabase env is not set. Copy `.env.example` to `.env.local`, set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or publishable key), then restart the dev server.",
    );
  }
}
