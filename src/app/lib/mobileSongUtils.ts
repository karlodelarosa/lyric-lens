import type {
  NewSongInput,
  Song,
  SongSectionType,
} from "../contexts/AppContext";

export type MobileSongFormSection = {
  id: string;
  type: SongSectionType;
  number: string;
  lyrics: string;
  intensity: number | null;
  backgroundVideoUrl: string | null;
};

export type MobileSongFormState = {
  title: string;
  artist: string;
  tags: string;
  sections: MobileSongFormSection[];
};

export function createEmptyMobileSongSection(
  id: string,
  number = "1",
): MobileSongFormSection {
  return {
    id,
    type: "verse",
    number,
    lyrics: "",
    intensity: null,
    backgroundVideoUrl: null,
  };
}

export function createMobileSongFormState(song?: Song): MobileSongFormState {
  if (!song) {
    return {
      title: "",
      artist: "",
      tags: "",
      sections: [createEmptyMobileSongSection("new-section-1")],
    };
  }

  return {
    title: song.title,
    artist: song.artist,
    tags: song.tags.join(", "),
    sections: song.sections.map((section, index) => ({
      id: section.id,
      type: section.type,
      number: section.number ? String(section.number) : String(index + 1),
      lyrics: section.lyrics,
      intensity: section.intensity ?? null,
      backgroundVideoUrl: section.backgroundVideoUrl ?? null,
    })),
  };
}

export function filterMobileSongs(songs: Song[], query: string): Song[] {
  const normalizedQuery = query.trim().toLowerCase();

  return songs
    .filter(
      (song) =>
        !normalizedQuery ||
        song.title.toLowerCase().includes(normalizedQuery) ||
        song.artist.toLowerCase().includes(normalizedQuery) ||
        song.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)),
    )
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function serializeMobileSongForm(
  form: MobileSongFormState,
  originalSong?: Song,
): NewSongInput {
  const title = form.title.trim();
  if (!title) throw new Error("Song title is required");

  const sections = form.sections
    .map((section) => ({
      type: section.type,
      number: section.number.trim()
        ? Number(section.number.trim())
        : undefined,
      lyrics: section.lyrics.trim(),
      intensity: section.intensity,
      backgroundVideoUrl: section.backgroundVideoUrl,
    }))
    .filter((section) => section.lyrics.length > 0);

  if (sections.length === 0) {
    throw new Error("Add lyrics to at least one section");
  }

  return {
    title,
    artist: form.artist.trim(),
    tags: [
      ...new Set(
        form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      ),
    ],
    sections,
    backgroundVideoUrl: originalSong?.backgroundVideoUrl ?? null,
  };
}
