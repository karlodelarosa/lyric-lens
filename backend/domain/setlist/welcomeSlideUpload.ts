export const WELCOME_SLIDE_MAX_BYTES = 20 * 1024 * 1024;

export const WELCOME_SLIDE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime";

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export type WelcomeSlideMediaType = "image" | "video";

export function getWelcomeSlideMediaType(
  mimeType: string,
): WelcomeSlideMediaType | null {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return null;
}

export function isAllowedWelcomeSlideMimeType(mimeType: string): boolean {
  return getWelcomeSlideMediaType(mimeType) !== null;
}

export function getWelcomeSlideExtension(
  mimeType: string,
  fileName?: string,
): string | null {
  const fromMime = MIME_TO_EXTENSION[mimeType.toLowerCase()];
  if (fromMime) return fromMime;

  if (!fileName) return null;
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? null;
}

export function buildWelcomeSlideStoragePath(
  organizationId: string,
  extension: string,
): string {
  const safeExtension = extension.replace(/[^a-z0-9]/gi, "").toLowerCase();
  const fileId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${organizationId}/${fileId}.${safeExtension || "bin"}`;
}
