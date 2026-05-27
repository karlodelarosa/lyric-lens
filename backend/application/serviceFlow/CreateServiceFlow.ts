import type { ServiceFlow } from "../../domain/serviceFlow/ServiceFlow";
import type { CreateServiceFlowInput } from "../../domain/serviceFlow/ServiceFlow";
import type { ServiceFlowRepository } from "../../domain/serviceFlow/ServiceFlowRepository";

export class CreateServiceFlow {
  constructor(private readonly repository: ServiceFlowRepository) {}

  execute(
    organizationId: string,
    createdBy: string,
    input: CreateServiceFlowInput,
  ): Promise<ServiceFlow> {
    return this.repository.create(organizationId, createdBy, input);
  }
}
