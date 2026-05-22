import { GetCurrentUser } from "@backend/application/auth/GetCurrentUser";
import { createAuthRepository } from "@backend/infrastructure/supabase/factory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const authRepository = await createAuthRepository();
    const useCase = new GetCurrentUser(authRepository);
    const user = await useCase.execute();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
