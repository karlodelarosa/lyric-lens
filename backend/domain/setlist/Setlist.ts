export type CreateSetlistInput = {
  title: string;
  songIds: string[];
};

export type UpdateSetlistInput = {
  title?: string;
  songIds?: string[];
};

type SetlistSongRow = {
  song_id: string;
  position: number;
};

export type SetlistListRow = {
  id: string;
  title: string;
  setlist_songs: SetlistSongRow[] | null;
};

export class Setlist {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly songs: string[],
  ) {}

  static fromListRow(row: SetlistListRow): Setlist {
    const songs = (row.setlist_songs ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((entry) => entry.song_id);

    return new Setlist(row.id, row.title, songs);
  }
}
