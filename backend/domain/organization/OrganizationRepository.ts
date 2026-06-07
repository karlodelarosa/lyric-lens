import type { Organization } from "./Organization";
import type {
  OrganizationMember,
  OrganizationRole,
} from "./OrganizationMember";
import type { OrgThemePresetId } from "./orgThemePresets";

export type CreateOrganizationInput = {
  name: string;
  slug: string;
};

export type UpdateOrganizationInput = {
  themePreset?: OrgThemePresetId;
  logoUrl?: string | null;
  showOrgNameInSidebar?: boolean;
};

export interface OrganizationRepository {
  list(): Promise<Organization[]>;
  create(
    createdBy: string,
    input: CreateOrganizationInput,
  ): Promise<Organization>;
  update(
    organizationId: string,
    input: UpdateOrganizationInput,
  ): Promise<Organization>;
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
