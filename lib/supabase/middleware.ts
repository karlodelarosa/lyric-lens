import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { tryGetSupabaseConfig } from "./config";

export async function updateSession(request: NextRequest) {
  const supabaseConfig = tryGetSupabaseConfig();
  if (!supabaseConfig) {
    // Do not crash middleware routes (like auth callback/invite links) when env is unavailable.
    return NextResponse.next({ request });
  }

  const { supabaseUrl, supabasePublishableKey } = supabaseConfig;
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set(name, value),
        );

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  await supabase.auth.getClaims();

  return response;
}
