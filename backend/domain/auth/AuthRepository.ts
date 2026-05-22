import type { AuthUser } from "./AuthUser";

export type SignInCredentials = {
  email: string;
  password: string;
};

export interface AuthRepository {
  signIn(credentials: SignInCredentials): Promise<AuthUser>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
}
