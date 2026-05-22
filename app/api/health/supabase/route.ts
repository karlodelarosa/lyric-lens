import { VerifyDatabaseConnection } from "@backend/application/connection/VerifyDatabaseConnection";
import { createSupabaseServerClient } from "@backend/infrastructure/supabase/server-client";
import { SupabaseConnectionChecker } from "@backend/infrastructure/supabase/SupabaseConnectionChecker";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await createSupabaseServerClient();
    const checker = new SupabaseConnectionChecker(client);
    const useCase = new VerifyDatabaseConnection(checker);
    const result = await useCase.execute();

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          projectRef: result.projectRef,
          checkedAt: result.checkedAt,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      projectRef: result.projectRef,
      checkedAt: result.checkedAt,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
