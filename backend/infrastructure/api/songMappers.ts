import type {
  CreateSongInput,
  Song,
  SongSectionType,
  TrashedSongItem,
} from "../../domain/song/Song";
import { SONG_SECTION_TYPES } from "../../domain/song/Song";

export function trashedSongToDto(item: TrashedSongItem) {
  return {
    id: item.id,
    title: item.title,
    artist: item.artist,
    deletedAt: item.deletedAt,
  };
}

export function songToDto(song: Song) {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    tags: song.tags,
    usageCount: song.usageCount,
    backgroundVideoUrl: song.backgroundVideoUrl,
    sections: song.sections.map((section) => ({
      id: section.id,
      type: section.type,
      number: section.number,
      lyrics: section.lyrics,
      intensity: section.intensity ?? null,
      backgroundVideoUrl: section.backgroundVideoUrl ?? null,
    })),
  };
}

function isSongSectionType(value: string): value is SongSectionType {
  return (SONG_SECTION_TYPES as readonly string[]).includes(value);
}

export function parseCreateSongBody(body: unknown): CreateSongInput | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const artist = typeof record.artist === "string" ? record.artist.trim() : "";

  if (!title) return null;

  const tags = Array.isArray(record.tags)
    ? record.tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  if (!Array.isArray(record.sections) || record.sections.length === 0) {
    return null;
  }

  const sections: CreateSongInput["sections"] = [];

  for (const section of record.sections) {
    if (!section || typeof section !== "object") return null;

    const sectionRecord = section as Record<string, unknown>;
    const type =
      typeof sectionRecord.type === "string" ? sectionRecord.type : "";
    const lyrics =
      typeof sectionRecord.lyrics === "string"
        ? sectionRecord.lyrics.trim()
        : "";

    if (!isSongSectionType(type) || !lyrics) return null;

    const numberValue = sectionRecord.number;
    const number =
      typeof numberValue === "number"
        ? numberValue
        : typeof numberValue === "string" && numberValue.trim()
          ? Number(numberValue)
          : undefined;

    const intensityValue = sectionRecord.intensity;
    const intensity =
      typeof intensityValue === "number"
        ? intensityValue
        : typeof intensityValue === "string" && intensityValue.trim()
          ? Number(intensityValue)
          : null;

    const sectionBackgroundVideoUrl =
      typeof sectionRecord.backgroundVideoUrl === "string"
        ? sectionRecord.backgroundVideoUrl.trim() || null
        : null;

    sections.push({
      type,
      number: Number.isFinite(number) ? number : undefined,
      lyrics,
      intensity:
        intensity !== null && Number.isFinite(intensity)
          ? Math.min(100, Math.max(0, Math.round(intensity)))
          : null,
      backgroundVideoUrl: sectionBackgroundVideoUrl,
    });
  }

  const backgroundVideoUrl =
    typeof record.backgroundVideoUrl === "string"
      ? record.backgroundVideoUrl.trim() || null
      : null;

  return { title, artist, tags, sections, backgroundVideoUrl };
}

export const parseUpdateSongBody = parseCreateSongBody;
