export type SetlistFlowSection = {
  name: string;
  songIds: string[];
};

export type CreateSetlistInput = {
  title: string;
  songIds: string[];
  flowSections?: SetlistFlowSection[];
};

export type UpdateSetlistInput = {
  title?: string;
  songIds?: string[];
  flowSections?: SetlistFlowSection[];
};

type SetlistSongRow = {
  song_id: string;
  position: number;
};

export type SetlistListRow = {
  id: string;
  title: string;
  flow_sections?: SetlistFlowSection[] | null;
  setlist_songs: SetlistSongRow[] | null;
};

export class Setlist {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly songs: string[],
    readonly flowSections: SetlistFlowSection[],
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

    return new Setlist(row.id, row.title, songs, flowSections);
  }
}
