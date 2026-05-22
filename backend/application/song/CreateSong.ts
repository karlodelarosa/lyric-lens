import type { CreateSongInput, Song } from "../../domain/song/Song";
import type { SongRepository } from "../../domain/song/SongRepository";

export class CreateSong {
  constructor(private readonly repository: SongRepository) {}

  async execute(
    organizationId: string,
    createdBy: string,
    input: CreateSongInput,
  ): Promise<Song> {
    return this.repository.create(organizationId, createdBy, input);
  }
}
