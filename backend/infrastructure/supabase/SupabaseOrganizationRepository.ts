import type { SupabaseClient } from "@supabase/supabase-js";
import { Organization } from "../../domain/organization/Organization";
import {
  OrganizationMember,
  type OrganizationRole,
} from "../../domain/organization/OrganizationMember";
import type {
  CreateOrganizationInput,
  OrganizationRepository,
  UpdateOrganizationInput,
} from "../../domain/organization/OrganizationRepository";
import type { Database } from "./database.types";

const ORGANIZATION_SELECT =
  "id, name, slug, created_by, created_at, theme_preset, logo_url, show_org_name_in_sidebar";

export class SupabaseOrganizationRepository implements OrganizationRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async list(): Promise<Organization[]> {
    const { data, error } = await this.client
      .from("organizations")
      .select(ORGANIZATION_SELECT)
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
      .select(ORGANIZATION_SELECT)
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

  async update(
    organizationId: string,
    input: UpdateOrganizationInput,
  ): Promise<Organization> {
    const patch: Database["public"]["Tables"]["organizations"]["Update"] = {};

    if (input.themePreset !== undefined) {
      patch.theme_preset = input.themePreset;
    }

    if (input.logoUrl !== undefined) {
      patch.logo_url = input.logoUrl;
    }

    if (input.showOrgNameInSidebar !== undefined) {
      patch.show_org_name_in_sidebar = input.showOrgNameInSidebar;
    }

    if (Object.keys(patch).length === 0) {
      const { data, error } = await this.client
        .from("organizations")
        .select(ORGANIZATION_SELECT)
        .eq("id", organizationId)
        .single();

      if (error || !data) {
        throw new Error("Failed to load organization");
      }

      return Organization.fromRow(data);
    }

    const { data, error } = await this.client
      .from("organizations")
      .update(patch)
      .eq("id", organizationId)
      .select(ORGANIZATION_SELECT)
      .single();

    if (error || !data) {
      throw new Error("Failed to update organization");
    }

    return Organization.fromRow(data);
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
