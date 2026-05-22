import type { SupabaseClient } from "@supabase/supabase-js";
import { AuthUser } from "../../domain/auth/AuthUser";
import type {
  AuthRepository,
  SignInCredentials,
  UpdateProfileInput,
} from "../../domain/auth/AuthRepository";
import type { Database } from "./database.types";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async signIn(credentials: SignInCredentials): Promise<AuthUser> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error || !data.user) {
      throw new AuthError("Invalid email or password");
    }

    return this.toAuthUser(data.user);
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) {
      throw new AuthError("Sign out failed");
    }
  }

  async updateProfile(input: UpdateProfileInput): Promise<AuthUser> {
    const displayName = input.displayName.trim();
    if (!displayName) {
      throw new AuthError("Display name is required");
    }

    const { data, error } = await this.client.auth.updateUser({
      data: { full_name: displayName, name: displayName },
    });

    if (error || !data.user) {
      throw new AuthError("Failed to update profile");
    }

    return this.toAuthUser(data.user);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data, error } = await this.client.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return this.toAuthUser(data.user);
  }

  private toAuthUser(user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  }): AuthUser {
    const meta = user.user_metadata ?? {};
    const displayName =
      (typeof meta.full_name === "string" && meta.full_name) ||
      (typeof meta.name === "string" && meta.name) ||
      user.email?.split("@")[0] ||
      "User";

    return new AuthUser(user.id, user.email ?? "", displayName);
  }
}
