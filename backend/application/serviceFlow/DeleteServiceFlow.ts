import type { ServiceFlowRepository } from "../../domain/serviceFlow/ServiceFlowRepository";

export class DeleteServiceFlow {
  constructor(private readonly repository: ServiceFlowRepository) {}

  execute(organizationId: string, serviceFlowId: string): Promise<void> {
    return this.repository.delete(organizationId, serviceFlowId);
  }
}
