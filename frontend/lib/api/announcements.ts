import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  parseApiResponse,
} from "./client";

export type AnnouncementSlideDto = {
  url: string;
  type: "image" | "video";
};

export type AnnouncementDto = {
  id: string;
  title: string;
  body: string;
  category: string | null;
  expiresAt: string | null;
  slides: AnnouncementSlideDto[];
};

export type AnnouncementsResponse = {
  announcements: AnnouncementDto[];
};

export type CreateAnnouncementPayload = {
  title: string;
  body: string;
  category?: string | null;
  expiresAt?: string | null;
  slides?: AnnouncementSlideDto[];
};

export type UpdateAnnouncementPayload = {
  title?: string;
  body?: string;
  category?: string | null;
  expiresAt?: string | null;
  slides?: AnnouncementSlideDto[];
};

export type UploadAnnouncementSlideResponse = {
  slide: AnnouncementSlideDto;
  storagePath: string;
};

export const ANNOUNCEMENT_SLIDE_MAX_BYTES = 20 * 1024 * 1024;

export { PRESENTATION_MEDIA_ACCEPT as ANNOUNCEMENT_SLIDE_ACCEPT } from "../mediaUpload";

export async function getAnnouncements(
  organizationId: string,
): Promise<AnnouncementsResponse> {
  return apiGet<AnnouncementsResponse>(
    `/api/organizations/${organizationId}/announcements`,
  );
}

export async function createAnnouncement(
  organizationId: string,
  payload: CreateAnnouncementPayload,
): Promise<{ announcement: AnnouncementDto }> {
  return apiPost<{ announcement: AnnouncementDto }>(
    `/api/organizations/${organizationId}/announcements`,
    payload,
  );
}

export async function updateAnnouncement(
  organizationId: string,
  announcementId: string,
  payload: UpdateAnnouncementPayload,
): Promise<{ announcement: AnnouncementDto }> {
  return apiPatch<{ announcement: AnnouncementDto }>(
    `/api/organizations/${organizationId}/announcements/${announcementId}`,
    payload,
  );
}

export async function deleteAnnouncement(
  organizationId: string,
  announcementId: string,
): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(
    `/api/organizations/${organizationId}/announcements/${announcementId}`,
  );
}

export async function uploadAnnouncementSlide(
  organizationId: string,
  file: File,
): Promise<UploadAnnouncementSlideResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `/api/organizations/${organizationId}/announcements/upload`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    },
  );

  return parseApiResponse<UploadAnnouncementSlideResponse>(response);
}
