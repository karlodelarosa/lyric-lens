import type { CreateSongInput, Song, SongSectionType } from "../../domain/song/Song";
import { SONG_SECTION_TYPES } from "../../domain/song/Song";

export function songToDto(song: Song) {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    tags: song.tags,
    usageCount: song.usageCount,
    sections: song.sections.map((section) => ({
      id: section.id,
      type: section.type,
      number: section.number,
      lyrics: section.lyrics,
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

    sections.push({
      type,
      number: Number.isFinite(number) ? number : undefined,
      lyrics,
    });
  }

  return { title, artist, tags, sections };
}
