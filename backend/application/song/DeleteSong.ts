import type { SongRepository } from "../../domain/song/SongRepository";

export class DeleteSong {
  constructor(private readonly repository: SongRepository) {}

  async execute(organizationId: string, songId: string): Promise<void> {
    return this.repository.delete(organizationId, songId);
  }
}
