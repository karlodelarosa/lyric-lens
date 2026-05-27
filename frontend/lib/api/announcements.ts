import { apiDelete, apiGet, apiPatch, apiPost } from "./client";

export type AnnouncementDto = {
  id: string;
  title: string;
  body: string;
  category: string | null;
  expiresAt: string | null;
};

export type AnnouncementsResponse = {
  announcements: AnnouncementDto[];
};

export type CreateAnnouncementPayload = {
  title: string;
  body: string;
  category?: string | null;
  expiresAt?: string | null;
};

export type UpdateAnnouncementPayload = {
  title?: string;
  body?: string;
  category?: string | null;
  expiresAt?: string | null;
};

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
