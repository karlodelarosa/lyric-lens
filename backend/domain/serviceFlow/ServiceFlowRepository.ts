import type { ServiceFlow, ServiceFlowListItem } from "./ServiceFlow";
import type {
  CreateServiceFlowInput,
  UpdateServiceFlowInput,
} from "./ServiceFlow";

export interface ServiceFlowRepository {
  listByOrganization(organizationId: string): Promise<ServiceFlowListItem[]>;
  getById(
    organizationId: string,
    serviceFlowId: string,
  ): Promise<ServiceFlow | null>;
  create(
    organizationId: string,
    createdBy: string,
    input: CreateServiceFlowInput,
  ): Promise<ServiceFlow>;
  update(
    organizationId: string,
    serviceFlowId: string,
    input: UpdateServiceFlowInput,
  ): Promise<ServiceFlow>;
  delete(organizationId: string, serviceFlowId: string): Promise<void>;
  duplicate(
    organizationId: string,
    createdBy: string,
    serviceFlowId: string,
  ): Promise<ServiceFlow>;
}
