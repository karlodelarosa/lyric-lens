import type { AnnouncementSlideDto } from "./announcements";

export function normalizeAnnouncementSlides(
  slides: AnnouncementSlideDto[] | null | undefined,
): AnnouncementSlideDto[] {
  if (!Array.isArray(slides)) return [];
  return slides.filter(
    (slide): slide is AnnouncementSlideDto =>
      Boolean(slide) &&
      typeof slide.url === "string" &&
      (slide.type === "image" || slide.type === "video"),
  );
}

export function normalizeAnnouncement<
  T extends {
    id: string;
    title: string;
    body: string;
    category: string | null;
    expiresAt: string | null;
    slides?: AnnouncementSlideDto[] | null;
  },
>(announcement: T): T & { slides: AnnouncementSlideDto[] } {
  return {
    ...announcement,
    slides: normalizeAnnouncementSlides(announcement.slides),
  };
}
