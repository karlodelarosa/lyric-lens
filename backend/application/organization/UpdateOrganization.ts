import type { Organization } from "../../domain/organization/Organization";
import type {
  OrganizationRepository,
  UpdateOrganizationInput,
} from "../../domain/organization/OrganizationRepository";

export class UpdateOrganization {
  constructor(private readonly repository: OrganizationRepository) {}

  async execute(
    organizationId: string,
    input: UpdateOrganizationInput,
  ): Promise<Organization> {
    return this.repository.update(organizationId, input);
  }
}
