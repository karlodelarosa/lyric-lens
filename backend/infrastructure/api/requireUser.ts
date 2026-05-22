import { GetCurrentUser } from "../../application/auth/GetCurrentUser";
import type { AuthUser } from "../../domain/auth/AuthUser";
import { createAuthRepository } from "../supabase/factory";

export async function requireUser(): Promise<AuthUser | null> {
  const authRepository = await createAuthRepository();
  return new GetCurrentUser(authRepository).execute();
}
