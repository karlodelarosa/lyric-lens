import { apiDelete, apiGet, apiPatch, apiPost, parseApiResponse } from "./client";

export type ServiceFlowSegmentKind =
  | "music"
  | "announcements"
  | "cue"
  | "song"
  | "welcome"
  | "countdown";

export type WelcomeMediaDto = {
  url: string;
  type: "image" | "video";
};

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
  songId: string | null;
  songTitle: string | null;
  songArtist: string | null;
  welcomeMedia: WelcomeMediaDto | null;
  countdownSeconds: number | null;
  announcements: ServiceFlowSegmentAnnouncementDto[];
};

export type ServiceFlowListItemDto = {
  id: string;
  title: string;
  description: string | null;
  segmentCount: number;
  updatedAt: string;
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
  songId?: string | null;
  welcomeMedia?: WelcomeMediaDto | null;
  countdownSeconds?: number | null;
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

export const SERVICE_FLOW_WELCOME_MEDIA_MAX_BYTES = 20 * 1024 * 1024;

export const SERVICE_FLOW_WELCOME_MEDIA_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime";

export type UploadServiceFlowWelcomeMediaResponse = {
  slide: WelcomeMediaDto;
};

export async function uploadServiceFlowWelcomeMedia(
  organizationId: string,
  file: File,
) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `/api/organizations/${organizationId}/service-flows/welcome-media/upload`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    },
  );

  return parseApiResponse<UploadServiceFlowWelcomeMediaResponse>(response);
}
