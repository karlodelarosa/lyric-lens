import type {
  OrganizationMember,
  OrganizationRole,
} from "../../domain/organization/OrganizationMember";
import type { OrganizationRepository } from "../../domain/organization/OrganizationRepository";

export class InviteOrganizationMember {
  constructor(private readonly repository: OrganizationRepository) {}

  async execute(
    organizationId: string,
    userId: string,
    role: OrganizationRole,
  ): Promise<OrganizationMember> {
    return this.repository.addMember(organizationId, userId, role);
  }
}
