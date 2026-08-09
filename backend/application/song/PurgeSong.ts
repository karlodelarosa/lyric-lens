import type { SongRepository } from "../../domain/song/SongRepository";

export class PurgeSong {
  constructor(private readonly repository: SongRepository) {}

  execute(organizationId: string, songId: string): Promise<void> {
    return this.repository.purge(organizationId, songId);
  }
}
