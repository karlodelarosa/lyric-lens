import { parseApiResponse } from "./client";

export type WelcomeSlideDto = {
  url: string;
  type: "image" | "video";
};

export type UploadWelcomeSlideResponse = {
  welcomeSlide: WelcomeSlideDto;
  storagePath: string;
};

export const WELCOME_SLIDE_MAX_BYTES = 20 * 1024 * 1024;

export const WELCOME_SLIDE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime";

export async function uploadWelcomeSlide(
  organizationId: string,
  file: File,
): Promise<UploadWelcomeSlideResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `/api/organizations/${organizationId}/welcome-slides/upload`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    },
  );

  return parseApiResponse<UploadWelcomeSlideResponse>(response);
}
