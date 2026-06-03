import type { Announcement } from "../../domain/announcement/Announcement";
import type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "../../domain/announcement/Announcement";
import {
  parseAnnouncementSlides,
  type AnnouncementSlide,
} from "../../domain/announcement/AnnouncementSlide";

export function announcementToDto(announcement: Announcement) {
  return {
    id: announcement.id,
    title: announcement.title,
    body: announcement.body,
    category: announcement.category,
    expiresAt: announcement.expiresAt,
    slides: announcement.slides,
  };
}

function parseSlidesInput(value: unknown): AnnouncementSlide[] | undefined {
  if (value === undefined) return undefined;
  return parseAnnouncementSlides(value);
}

export function parseCreateAnnouncementBody(
  body: unknown,
): CreateAnnouncementInput | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const bodyText = typeof record.body === "string" ? record.body : "";

  if (!title) return null;

  const category =
    typeof record.category === "string" ? record.category.trim() : null;

  const expiresAt =
    record.expiresAt === null
      ? null
      : typeof record.expiresAt === "string"
        ? record.expiresAt
        : undefined;

  const slides = parseSlidesInput(record.slides);

  return {
    title,
    body: bodyText,
    category: category || null,
    expiresAt,
    ...(slides !== undefined ? { slides } : {}),
  };
}

export function parseUpdateAnnouncementBody(
  body: unknown,
): UpdateAnnouncementInput | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const input: UpdateAnnouncementInput = {};

  if (typeof record.title === "string") {
    const title = record.title.trim();
    if (!title) return null;
    input.title = title;
  }

  if (typeof record.body === "string") {
    input.body = record.body;
  }

  if (record.category === null) {
    input.category = null;
  } else if (typeof record.category === "string") {
    input.category = record.category.trim() || null;
  }

  if (record.expiresAt === null) {
    input.expiresAt = null;
  } else if (typeof record.expiresAt === "string") {
    input.expiresAt = record.expiresAt;
  }

  const slides = parseSlidesInput(record.slides);
  if (slides !== undefined) {
    input.slides = slides;
  }

  if (
    input.title === undefined &&
    input.body === undefined &&
    input.category === undefined &&
    input.expiresAt === undefined &&
    input.slides === undefined
  ) {
    return null;
  }

  return input;
}
