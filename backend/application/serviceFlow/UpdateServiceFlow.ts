import type { ServiceFlow } from "../../domain/serviceFlow/ServiceFlow";
import type { UpdateServiceFlowInput } from "../../domain/serviceFlow/ServiceFlow";
import type { ServiceFlowRepository } from "../../domain/serviceFlow/ServiceFlowRepository";

export class UpdateServiceFlow {
  constructor(private readonly repository: ServiceFlowRepository) {}

  execute(
    organizationId: string,
    serviceFlowId: string,
    input: UpdateServiceFlowInput,
  ): Promise<ServiceFlow> {
    return this.repository.update(organizationId, serviceFlowId, input);
  }
}
