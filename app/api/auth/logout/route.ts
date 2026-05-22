import { SignOut } from "@backend/application/auth/SignOut";
import { createAuthRepository } from "@backend/infrastructure/supabase/factory";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const authRepository = await createAuthRepository();
    const useCase = new SignOut(authRepository);
    await useCase.execute();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
