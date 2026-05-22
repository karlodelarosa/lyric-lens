import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublishableKey, getSupabaseUrl } from "../config/env";
import type { Database } from "./database.types";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component; proxy handles session refresh.
          }
        },
      },
    },
  );
}
