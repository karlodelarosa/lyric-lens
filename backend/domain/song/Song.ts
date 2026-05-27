export const SONG_SECTION_TYPES = [
  "intro",
  "verse",
  "chorus",
  "bridge",
  "pre_chorus",
  "outro",
  "tag",
  "custom",
] as const;

export type SongSectionType = (typeof SONG_SECTION_TYPES)[number];

export type SongSection = {
  id: string;
  type: SongSectionType;
  number?: number;
  lyrics: string;
};

export type CreateSongSectionInput = {
  type: SongSectionType;
  number?: number;
  lyrics: string;
};

export type CreateSongInput = {
  title: string;
  artist: string;
  tags: string[];
  sections: CreateSongSectionInput[];
};

export type UpdateSongInput = CreateSongInput;

type SongSectionRow = {
  id: string;
  section_type: string;
  section_number: number | null;
  content: string;
  position: number;
};

type SongTagLinkRow = {
  song_tags: { name: string } | null;
};

export type SongListRow = {
  id: string;
  title: string;
  artist: string | null;
  song_sections: SongSectionRow[] | null;
  song_tag_links: SongTagLinkRow[] | null;
};

export class Song {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly artist: string,
    readonly sections: SongSection[],
    readonly tags: string[],
    readonly usageCount: number,
  ) {}

  static fromListRow(row: SongListRow): Song {
    const sections = (row.song_sections ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((section) => ({
        id: section.id,
        type: section.section_type as SongSectionType,
        number: section.section_number ?? undefined,
        lyrics: section.content,
      }));

    const tags = (row.song_tag_links ?? [])
      .map((link) => link.song_tags?.name)
      .filter((name): name is string => Boolean(name))
      .sort((a, b) => a.localeCompare(b));

    return new Song(row.id, row.title, row.artist ?? "", sections, tags, 0);
  }

  static withUsageCount(song: Song, usageCount: number): Song {
    return new Song(
      song.id,
      song.title,
      song.artist,
      song.sections,
      song.tags,
      usageCount,
    );
  }
}
