import { apiDelete, apiGet, apiPatch, apiPost } from "./client";

export type SetlistDto = {
  id: string;
  name: string;
  songs: string[];
};

export type SetlistsResponse = {
  setlists: SetlistDto[];
};

export type CreateSetlistPayload = {
  title: string;
  songIds: string[];
};

export type UpdateSetlistPayload = {
  title?: string;
  songIds?: string[];
};

export async function getSetlists(
  organizationId: string,
): Promise<SetlistsResponse> {
  return apiGet<SetlistsResponse>(
    `/api/organizations/${organizationId}/setlists`,
  );
}

export async function createSetlist(
  organizationId: string,
  payload: CreateSetlistPayload,
): Promise<{ setlist: SetlistDto }> {
  return apiPost<{ setlist: SetlistDto }>(
    `/api/organizations/${organizationId}/setlists`,
    payload,
  );
}

export async function updateSetlist(
  organizationId: string,
  setlistId: string,
  payload: UpdateSetlistPayload,
): Promise<{ setlist: SetlistDto }> {
  return apiPatch<{ setlist: SetlistDto }>(
    `/api/organizations/${organizationId}/setlists/${setlistId}`,
    payload,
  );
}

export async function deleteSetlist(
  organizationId: string,
  setlistId: string,
): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(
    `/api/organizations/${organizationId}/setlists/${setlistId}`,
  );
}
