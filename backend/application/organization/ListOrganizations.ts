import type { Organization } from "../../domain/organization/Organization";
import type { OrganizationRepository } from "../../domain/organization/OrganizationRepository";

export class ListOrganizations {
  constructor(private readonly repository: OrganizationRepository) {}

  async execute(): Promise<Organization[]> {
    return this.repository.list();
  }
}
