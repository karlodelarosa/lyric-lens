import { apiGet, apiPost, apiPatch, parseApiResponse } from "./client";
import type { OrgThemePresetId } from "@backend/domain/organization/orgThemePresets";

export type OrganizationDto = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  themePreset: OrgThemePresetId;
  logoUrl: string | null;
  showOrgNameInSidebar: boolean;
};

export type OrganizationMemberDto = {
  id: string;
  userId: string;
  role: "admin" | "operator" | "viewer";
  createdAt: string;
};

export type OrganizationsResponse = {
  organizations: OrganizationDto[];
};

export type CreateOrganizationPayload = {
  name: string;
  slug?: string;
};

export type CreateOrganizationResponse = {
  organization: OrganizationDto;
};

export type OrganizationMembersResponse = {
  members: OrganizationMemberDto[];
};

export type InviteMemberPayload = {
  userId: string;
  role: "admin" | "operator" | "viewer";
};

export type InviteMemberResponse = {
  member: OrganizationMemberDto;
};

export async function getOrganizations(): Promise<OrganizationsResponse> {
  return apiGet<OrganizationsResponse>("/api/organizations");
}

export async function createOrganization(
  payload: CreateOrganizationPayload,
): Promise<CreateOrganizationResponse> {
  return apiPost<CreateOrganizationResponse>("/api/organizations", payload);
}

export async function getOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMembersResponse> {
  return apiGet<OrganizationMembersResponse>(
    `/api/organizations/${organizationId}/members`,
  );
}

export async function inviteOrganizationMember(
  organizationId: string,
  payload: InviteMemberPayload,
): Promise<InviteMemberResponse> {
  return apiPost<InviteMemberResponse>(
    `/api/organizations/${organizationId}/members`,
    payload,
  );
}

export type UpdateOrganizationPayload = {
  themePreset?: OrgThemePresetId;
  logoUrl?: string | null;
  showOrgNameInSidebar?: boolean;
};

export type UpdateOrganizationResponse = {
  organization: OrganizationDto;
};

export async function updateOrganization(
  organizationId: string,
  payload: UpdateOrganizationPayload,
): Promise<UpdateOrganizationResponse> {
  return apiPatch<UpdateOrganizationResponse>(
    `/api/organizations/${organizationId}`,
    payload,
  );
}

export const ORG_LOGO_MAX_BYTES = 2 * 1024 * 1024;

export const ORG_LOGO_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml";

export type UploadOrganizationLogoResponse = {
  organization: OrganizationDto;
  logoUrl: string | null;
  storagePath: string;
};

export async function uploadOrganizationLogo(
  organizationId: string,
  file: File,
): Promise<UploadOrganizationLogoResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `/api/organizations/${organizationId}/logo/upload`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    },
  );

  return parseApiResponse<UploadOrganizationLogoResponse>(response);
}
