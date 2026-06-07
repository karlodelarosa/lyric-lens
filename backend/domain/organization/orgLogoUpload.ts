export const ORG_LOGO_MAX_BYTES = 2 * 1024 * 1024;

export const ORG_LOGO_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml";

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
  "svg",
]);

export function isAllowedOrgLogoFile(file: {
  type: string;
  name: string;
}): boolean {
  const mimeType = file.type.trim().toLowerCase();
  if (mimeType.startsWith("image/")) return true;

  const extension = getOrgLogoExtension(mimeType, file.name);
  return extension !== null && IMAGE_EXTENSIONS.has(extension);
}

export function getOrgLogoExtension(
  mimeType: string,
  fileName?: string,
): string | null {
  const fromMime = MIME_TO_EXTENSION[mimeType.toLowerCase()];
  if (fromMime) return fromMime;

  if (!fileName) return null;
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? null;
}

export function buildOrgLogoStoragePath(
  organizationId: string,
  extension: string,
): string {
  const safeExtension = extension.replace(/[^a-z0-9]/gi, "").toLowerCase();
  return `${organizationId}/logo.${safeExtension || "png"}`;
}
