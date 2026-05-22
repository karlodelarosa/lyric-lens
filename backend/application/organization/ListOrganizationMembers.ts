import type { OrganizationMember } from "../../domain/organization/OrganizationMember";
import type { OrganizationRepository } from "../../domain/organization/OrganizationRepository";

export class ListOrganizationMembers {
  constructor(private readonly repository: OrganizationRepository) {}

  async execute(organizationId: string): Promise<OrganizationMember[]> {
    return this.repository.listMembers(organizationId);
  }
}
