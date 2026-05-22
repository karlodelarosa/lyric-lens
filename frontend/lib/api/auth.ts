import { apiGet, apiPost } from "./client";

export type AuthUserDto = {
  id: string;
  email: string;
  displayName: string;
};

export type SessionResponse = {
  user: AuthUserDto | null;
};

export type LoginResponse = {
  user: AuthUserDto;
};

export async function getSession(): Promise<SessionResponse> {
  return apiGet<SessionResponse>("/api/auth/session");
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return apiPost<LoginResponse>("/api/auth/login", { email, password });
}

export async function logout(): Promise<{ ok: boolean }> {
  return apiPost<{ ok: boolean }>("/api/auth/logout");
}
