import type { SupabaseClient } from "@supabase/supabase-js";
import { Organization } from "../../domain/organization/Organization";
import type { OrganizationRepository } from "../../domain/organization/OrganizationRepository";
import type { Database } from "./database.types";

export class SupabaseOrganizationRepository implements OrganizationRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async list(): Promise<Organization[]> {
    const { data, error } = await this.client
      .from("organizations")
      .select("id, name, slug, created_by, created_at")
      .order("name");

    if (error) {
      throw new Error("Failed to load organizations");
    }

    return (data ?? []).map((row) => Organization.fromRow(row));
  }
}
