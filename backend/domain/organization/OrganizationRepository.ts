import type { Organization } from "./Organization";

export interface OrganizationRepository {
  list(): Promise<Organization[]>;
}
