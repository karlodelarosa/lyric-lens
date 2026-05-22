import { SignIn } from "@backend/application/auth/SignIn";
import { AuthError } from "@backend/infrastructure/supabase/SupabaseAuthRepository";
import { createAuthRepository } from "@backend/infrastructure/supabase/factory";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const authRepository = await createAuthRepository();
    const useCase = new SignIn(authRepository);
    const user = await useCase.execute({ email, password });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
