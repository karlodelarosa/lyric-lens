import type { CreateSongInput, Song } from "./Song";

export interface SongRepository {
  listByOrganization(organizationId: string): Promise<Song[]>;
  create(
    organizationId: string,
    createdBy: string,
    input: CreateSongInput,
  ): Promise<Song>;
  delete(organizationId: string, songId: string): Promise<void>;
}
