import type { Song, UpdateSongInput } from "../../domain/song/Song";
import type { SongRepository } from "../../domain/song/SongRepository";

export class UpdateSong {
  constructor(private readonly repository: SongRepository) {}

  async execute(
    organizationId: string,
    songId: string,
    input: UpdateSongInput,
  ): Promise<Song> {
    return this.repository.update(organizationId, songId, input);
  }
}
