import type { Organization } from "../../domain/organization/Organization";
import type {
  CreateOrganizationInput,
  OrganizationRepository,
} from "../../domain/organization/OrganizationRepository";

export class CreateOrganization {
  constructor(private readonly repository: OrganizationRepository) {}

  async execute(
    createdBy: string,
    input: CreateOrganizationInput,
  ): Promise<Organization> {
    return this.repository.create(createdBy, input);
  }
}
