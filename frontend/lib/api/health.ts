import { apiGet } from "./client";

export type SupabaseHealthResponse = {
  ok: boolean;
  projectRef?: string;
  checkedAt?: string;
};

export async function getSupabaseHealth(): Promise<SupabaseHealthResponse> {
  return apiGet<SupabaseHealthResponse>("/api/health/supabase");
}
