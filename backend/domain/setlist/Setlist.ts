export type SetlistFlowSection = {
  name: string;
  songIds: string[];
};

export type WelcomeSlide = {
  url: string;
  type: "image" | "video";
};

export type CreateSetlistInput = {
  title: string;
  songIds: string[];
  flowSections?: SetlistFlowSection[];
  welcomeSlide?: WelcomeSlide | null;
};

export type UpdateSetlistInput = {
  title?: string;
  songIds?: string[];
  flowSections?: SetlistFlowSection[];
  welcomeSlide?: WelcomeSlide | null;
};

type SetlistSongRow = {
  song_id: string;
  position: number;
};

export type SetlistListRow = {
  id: string;
  title: string;
  updated_at?: string;
  flow_sections?: SetlistFlowSection[] | null;
  welcome_slide?: WelcomeSlide | null;
  setlist_songs: SetlistSongRow[] | null;
};

function parseWelcomeSlide(value: unknown): WelcomeSlide | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const url = typeof record.url === "string" ? record.url.trim() : "";
  const type =
    record.type === "video"
      ? "video"
      : record.type === "image"
        ? "image"
        : null;
  if (!url || !type) return null;
  return { url, type };
}

export class Setlist {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly songs: string[],
    readonly flowSections: SetlistFlowSection[],
    readonly welcomeSlide: WelcomeSlide | null = null,
    readonly updatedAt: string | null = null,
  ) {}

  static fromListRow(row: SetlistListRow): Setlist {
    const songs = (row.setlist_songs ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((entry) => entry.song_id);

    const flowSections = Array.isArray(row.flow_sections)
      ? row.flow_sections.filter(
          (section): section is SetlistFlowSection =>
            Boolean(section) &&
            typeof section.name === "string" &&
            Array.isArray(section.songIds),
        )
      : [];

    const welcomeSlide = parseWelcomeSlide(row.welcome_slide);

    return new Setlist(
      row.id,
      row.title,
      songs,
      flowSections,
      welcomeSlide,
      row.updated_at ?? null,
    );
  }
}
