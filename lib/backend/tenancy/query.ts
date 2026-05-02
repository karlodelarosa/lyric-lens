import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { createClient } from "../../supabase/server";
import type { TenantContext } from "./context";
import { getTenantContext } from "./context";

type TenantExecutor<T> = (args: {
  supabase: SupabaseClient;
  tenant: TenantContext;
}) => Promise<T>;

type TenantHttpResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse };

function toAuthErrorResponse(message: string) {
  const status = message === "Unauthorized" ? 401 : 403;
  return NextResponse.json({ error: message }, { status });
}

export async function withTenantQuery<T>(
  executor: TenantExecutor<T>,
): Promise<TenantHttpResult<T>> {
  const supabase = await createClient();

  let tenant: TenantContext;
  try {
    tenant = await getTenantContext();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return { ok: false, response: toAuthErrorResponse(message) };
  }

  try {
    const data = await executor({ supabase, tenant });
    return { ok: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return {
      ok: false,
      response: NextResponse.json({ error: message }, { status: 500 }),
    };
  }
}
