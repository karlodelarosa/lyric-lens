import type { SongRepository } from "../../domain/song/SongRepository";

export class RestoreSong {
  constructor(private readonly repository: SongRepository) {}

  execute(organizationId: string, songId: string): Promise<void> {
    return this.repository.restore(organizationId, songId);
  }
}
