import type { Organization } from "./Organization";
import type { OrganizationMember, OrganizationRole } from "./OrganizationMember";

export type CreateOrganizationInput = {
  name: string;
  slug: string;
};

export interface OrganizationRepository {
  list(): Promise<Organization[]>;
  create(createdBy: string, input: CreateOrganizationInput): Promise<Organization>;
  getMemberRole(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationRole | null>;
  listMembers(organizationId: string): Promise<OrganizationMember[]>;
  addMember(
    organizationId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<OrganizationMember>;
}
