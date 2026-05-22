import { apiDelete, apiGet, apiPatch, apiPost } from "./client";

export type SongSectionDto = {
  id: string;
  type: string;
  number?: number;
  lyrics: string;
};

export type SongDto = {
  id: string;
  title: string;
  artist: string;
  tags: string[];
  usageCount: number;
  sections: SongSectionDto[];
};

export type SongsResponse = {
  songs: SongDto[];
};

export type CreateSongPayload = {
  title: string;
  artist: string;
  tags: string[];
  sections: {
    type: string;
    number?: number;
    lyrics: string;
  }[];
};

export type CreateSongResponse = {
  song: SongDto;
};

export type UpdateSongPayload = CreateSongPayload;

export type UpdateSongResponse = {
  song: SongDto;
};

export async function getSongs(organizationId: string): Promise<SongsResponse> {
  return apiGet<SongsResponse>(`/api/organizations/${organizationId}/songs`);
}

export async function createSong(
  organizationId: string,
  payload: CreateSongPayload,
): Promise<CreateSongResponse> {
  return apiPost<CreateSongResponse>(
    `/api/organizations/${organizationId}/songs`,
    payload,
  );
}

export async function updateSong(
  organizationId: string,
  songId: string,
  payload: UpdateSongPayload,
): Promise<UpdateSongResponse> {
  return apiPatch<UpdateSongResponse>(
    `/api/organizations/${organizationId}/songs/${songId}`,
    payload,
  );
}

export async function deleteSong(
  organizationId: string,
  songId: string,
): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(
    `/api/organizations/${organizationId}/songs/${songId}`,
  );
}
