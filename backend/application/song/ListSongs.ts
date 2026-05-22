import type { Song } from "../../domain/song/Song";
import type { SongRepository } from "../../domain/song/SongRepository";

export class ListSongs {
  constructor(private readonly repository: SongRepository) {}

  async execute(organizationId: string): Promise<Song[]> {
    return this.repository.listByOrganization(organizationId);
  }
}
