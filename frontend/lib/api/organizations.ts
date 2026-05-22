import { apiGet, apiPost } from "./client";

export type OrganizationDto = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
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
