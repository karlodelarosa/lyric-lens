export type AnnouncementSlide = {
  url: string;
  type: "image" | "video";
};

export function parseAnnouncementSlides(value: unknown): AnnouncementSlide[] {
  if (!Array.isArray(value)) return [];

  const slides: AnnouncementSlide[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const url = typeof record.url === "string" ? record.url.trim() : "";
    const type =
      record.type === "video"
        ? "video"
        : record.type === "image"
          ? "image"
          : null;
    if (!url || !type) continue;
    slides.push({ url, type });
  }

  return slides;
}
