import { createSupabaseServerClient } from "./server-client";
import { SupabaseAuthRepository } from "./SupabaseAuthRepository";
import { SupabaseOrganizationRepository } from "./SupabaseOrganizationRepository";

export async function createAuthRepository() {
  const client = await createSupabaseServerClient();
  return new SupabaseAuthRepository(client);
}

export async function createOrganizationRepository() {
  const client = await createSupabaseServerClient();
  return new SupabaseOrganizationRepository(client);
}
