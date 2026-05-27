import type { ServiceFlow } from "../../domain/serviceFlow/ServiceFlow";
import type { ServiceFlowRepository } from "../../domain/serviceFlow/ServiceFlowRepository";

export class GetServiceFlow {
  constructor(private readonly repository: ServiceFlowRepository) {}

  execute(
    organizationId: string,
    serviceFlowId: string,
  ): Promise<ServiceFlow | null> {
    return this.repository.getById(organizationId, serviceFlowId);
  }
}
