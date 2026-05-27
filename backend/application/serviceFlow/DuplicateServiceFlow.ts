import type { ServiceFlow } from "../../domain/serviceFlow/ServiceFlow";
import type { ServiceFlowRepository } from "../../domain/serviceFlow/ServiceFlowRepository";

export class DuplicateServiceFlow {
  constructor(private readonly repository: ServiceFlowRepository) {}

  execute(
    organizationId: string,
    createdBy: string,
    serviceFlowId: string,
  ): Promise<ServiceFlow> {
    return this.repository.duplicate(organizationId, createdBy, serviceFlowId);
  }
}
