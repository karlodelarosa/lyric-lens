import { apiDelete, apiGet, apiPatch, apiPost } from "./client";

export type ServiceFlowSegmentKind = "music" | "announcements" | "cue";

export type ServiceFlowSegmentAnnouncementDto = {
  id: string;
  title: string;
  body: string;
  category: string | null;
  expiresAt: string | null;
  slides: { url: string; type: "image" | "video" }[];
};

export type ServiceFlowSegmentDto = {
  id: string;
  position: number;
  label: string;
  kind: ServiceFlowSegmentKind;
  notes: string | null;
  setlistId: string | null;
  setlistName: string | null;
  announcements: ServiceFlowSegmentAnnouncementDto[];
};

export type ServiceFlowListItemDto = {
  id: string;
  title: string;
  description: string | null;
  segmentCount: number;
};

export type ServiceFlowDto = {
  id: string;
  title: string;
  description: string | null;
  segments: ServiceFlowSegmentDto[];
};

export type ServiceFlowSegmentInput = {
  label: string;
  kind: ServiceFlowSegmentKind;
  notes?: string | null;
  setlistId?: string | null;
  announcementIds?: string[];
};

export type CreateServiceFlowPayload = {
  title: string;
  description?: string | null;
  segments: ServiceFlowSegmentInput[];
};

export type UpdateServiceFlowPayload = {
  title?: string;
  description?: string | null;
  segments?: ServiceFlowSegmentInput[];
};

export async function getServiceFlows(organizationId: string) {
  return apiGet<{ serviceFlows: ServiceFlowListItemDto[] }>(
    `/api/organizations/${organizationId}/service-flows`,
  );
}

export async function getServiceFlow(
  organizationId: string,
  serviceFlowId: string,
) {
  return apiGet<{ serviceFlow: ServiceFlowDto }>(
    `/api/organizations/${organizationId}/service-flows/${serviceFlowId}`,
  );
}

export async function createServiceFlow(
  organizationId: string,
  payload: CreateServiceFlowPayload,
) {
  return apiPost<{ serviceFlow: ServiceFlowDto }>(
    `/api/organizations/${organizationId}/service-flows`,
    payload,
  );
}

export async function updateServiceFlow(
  organizationId: string,
  serviceFlowId: string,
  payload: UpdateServiceFlowPayload,
) {
  return apiPatch<{ serviceFlow: ServiceFlowDto }>(
    `/api/organizations/${organizationId}/service-flows/${serviceFlowId}`,
    payload,
  );
}

export async function deleteServiceFlow(
  organizationId: string,
  serviceFlowId: string,
) {
  return apiDelete<{ ok: boolean }>(
    `/api/organizations/${organizationId}/service-flows/${serviceFlowId}`,
  );
}

export async function duplicateServiceFlow(
  organizationId: string,
  serviceFlowId: string,
) {
  return apiPost<{ serviceFlow: ServiceFlowDto }>(
    `/api/organizations/${organizationId}/service-flows/${serviceFlowId}/duplicate`,
    {},
  );
}
