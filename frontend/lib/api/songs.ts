import { apiDelete, apiGet, apiPatch, apiPost, parseApiResponse } from "./client";

export type SongSectionDto = {
  id: string;
  type: string;
  number?: number;
  lyrics: string;
  intensity?: number | null;
};

export type SongDto = {
  id: string;
  title: string;
  artist: string;
  tags: string[];
  usageCount: number;
  sections: SongSectionDto[];
  backgroundVideoUrl: string | null;
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
    intensity?: number | null;
  }[];
  backgroundVideoUrl?: string | null;
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

export const SONG_BACKGROUND_VIDEO_MAX_BYTES = 20 * 1024 * 1024;

export const SONG_BACKGROUND_VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime";

export type UploadSongBackgroundVideoResponse = {
  slide: { url: string; type: "image" | "video" };
  storagePath: string;
};

export type TrashedSongDto = {
  id: string;
  title: string;
  artist: string;
  deletedAt: string;
};

export async function getTrashedSongs(
  organizationId: string,
): Promise<{ songs: TrashedSongDto[] }> {
  return apiGet<{ songs: TrashedSongDto[] }>(
    `/api/organizations/${organizationId}/songs/trash`,
  );
}

export async function restoreSong(
  organizationId: string,
  songId: string,
): Promise<{ ok: boolean }> {
  return apiPost<{ ok: boolean }>(
    `/api/organizations/${organizationId}/songs/${songId}/restore`,
    {},
  );
}

export async function purgeSong(
  organizationId: string,
  songId: string,
): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(
    `/api/organizations/${organizationId}/songs/${songId}/purge`,
  );
}

export async function uploadSongBackgroundVideo(
  organizationId: string,
  file: File,
): Promise<UploadSongBackgroundVideoResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `/api/organizations/${organizationId}/songs/upload`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    },
  );

  return parseApiResponse<UploadSongBackgroundVideoResponse>(response);
}
