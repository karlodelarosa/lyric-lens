export const PRESENTATION_MEDIA_MAX_BYTES = 20 * 1024 * 1024;

export const PRESENTATION_MEDIA_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.heif,.mp4,.webm,.mov";

const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
  "heic",
  "heif",
  "mp4",
  "webm",
  "mov",
]);

export function getFileExtension(fileName: string): string | null {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? null;
}

export function isAllowedPresentationMediaFile(file: File): boolean {
  const mime = file.type.trim().toLowerCase();
  if (mime.startsWith("image/") || mime.startsWith("video/")) {
    return true;
  }

  const extension = getFileExtension(file.name);
  return extension !== null && ALLOWED_EXTENSIONS.has(extension);
}

export function presentationMediaValidationError(file: File): string | null {
  if (file.size <= 0) return `${file.name} is empty`;
  if (file.size > PRESENTATION_MEDIA_MAX_BYTES) {
    return `${file.name} exceeds the 20 MB limit`;
  }
  if (!isAllowedPresentationMediaFile(file)) {
    return `${file.name} is not a supported image or video`;
  }
  return null;
}
