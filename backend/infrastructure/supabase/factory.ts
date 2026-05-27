import { createSupabaseServerClient } from "./server-client";
import { SupabaseAuthRepository } from "./SupabaseAuthRepository";
import { SupabaseOrganizationRepository } from "./SupabaseOrganizationRepository";
import { SupabaseAnnouncementRepository } from "./SupabaseAnnouncementRepository";
import { SupabaseEventRepository } from "./SupabaseEventRepository";
import { SupabaseServiceFlowRepository } from "./SupabaseServiceFlowRepository";
import { SupabaseSetlistRepository } from "./SupabaseSetlistRepository";
import { SupabaseSongRepository } from "./SupabaseSongRepository";

export async function createAuthRepository() {
  const client = await createSupabaseServerClient();
  return new SupabaseAuthRepository(client);
}

export async function createOrganizationRepository() {
  const client = await createSupabaseServerClient();
  return new SupabaseOrganizationRepository(client);
}

export async function createSongRepository() {
  const client = await createSupabaseServerClient();
  return new SupabaseSongRepository(client);
}

export async function createSetlistRepository() {
  const client = await createSupabaseServerClient();
  return new SupabaseSetlistRepository(client);
}

export async function createEventRepository() {
  const client = await createSupabaseServerClient();
  return new SupabaseEventRepository(client);
}

export async function createAnnouncementRepository() {
  const client = await createSupabaseServerClient();
  return new SupabaseAnnouncementRepository(client);
}

export async function createServiceFlowRepository() {
  const client = await createSupabaseServerClient();
  return new SupabaseServiceFlowRepository(client);
}
