import { apiGet } from "./client";

export type OrganizationDto = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type OrganizationsResponse = {
  organizations: OrganizationDto[];
};

export async function getOrganizations(): Promise<OrganizationsResponse> {
  return apiGet<OrganizationsResponse>("/api/organizations");
}
