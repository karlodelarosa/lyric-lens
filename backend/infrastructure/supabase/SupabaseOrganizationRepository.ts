import type { SupabaseClient } from "@supabase/supabase-js";
import { Organization } from "../../domain/organization/Organization";
import {
  OrganizationMember,
  type OrganizationRole,
} from "../../domain/organization/OrganizationMember";
import type {
  CreateOrganizationInput,
  OrganizationRepository,
} from "../../domain/organization/OrganizationRepository";
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

  async create(
    createdBy: string,
    input: CreateOrganizationInput,
  ): Promise<Organization> {
    const { data: orgRow, error: orgError } = await this.client
      .from("organizations")
      .insert({
        name: input.name.trim(),
        slug: input.slug,
        created_by: createdBy,
      })
      .select("id, name, slug, created_by, created_at")
      .single();

    if (orgError || !orgRow) {
      throw new Error("Failed to create organization");
    }

    const { error: memberError } = await this.client
      .from("organization_members")
      .insert({
        organization_id: orgRow.id,
        user_id: createdBy,
        role: "admin",
      });

    if (memberError) {
      await this.client.from("organizations").delete().eq("id", orgRow.id);
      throw new Error("Failed to add organization admin");
    }

    return Organization.fromRow(orgRow);
  }

  async getMemberRole(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationRole | null> {
    const { data, error } = await this.client
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;

    const role = data.role as OrganizationRole;
    if (role === "admin" || role === "operator" || role === "viewer") {
      return role;
    }

    return "viewer";
  }

  async listMembers(organizationId: string): Promise<OrganizationMember[]> {
    const { data, error } = await this.client
      .from("organization_members")
      .select("id, organization_id, user_id, role, created_at")
      .eq("organization_id", organizationId)
      .order("created_at");

    if (error) {
      throw new Error("Failed to load organization members");
    }

    return (data ?? []).map((row) => OrganizationMember.fromRow(row));
  }

  async addMember(
    organizationId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<OrganizationMember> {
    const { data, error } = await this.client
      .from("organization_members")
      .insert({
        organization_id: organizationId,
        user_id: userId,
        role,
      })
      .select("id, organization_id, user_id, role, created_at")
      .single();

    if (error || !data) {
      throw new Error("Failed to invite organization member");
    }

    return OrganizationMember.fromRow(data);
  }
}
