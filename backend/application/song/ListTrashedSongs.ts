import type { TrashedSongItem } from "../../domain/song/Song";
import type { SongRepository } from "../../domain/song/SongRepository";

export class ListTrashedSongs {
  constructor(private readonly repository: SongRepository) {}

  execute(organizationId: string): Promise<TrashedSongItem[]> {
    return this.repository.listTrashed(organizationId);
  }
}
