import type { ServiceFlowListItem } from "../../domain/serviceFlow/ServiceFlow";
import type { ServiceFlowRepository } from "../../domain/serviceFlow/ServiceFlowRepository";

export class ListServiceFlows {
  constructor(private readonly repository: ServiceFlowRepository) {}

  execute(organizationId: string): Promise<ServiceFlowListItem[]> {
    return this.repository.listByOrganization(organizationId);
  }
}
