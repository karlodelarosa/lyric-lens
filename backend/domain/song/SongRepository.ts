import type { CreateSongInput, Song, UpdateSongInput } from "./Song";

export interface SongRepository {
  listByOrganization(organizationId: string): Promise<Song[]>;
  create(
    organizationId: string,
    createdBy: string,
    input: CreateSongInput,
  ): Promise<Song>;
  update(
    organizationId: string,
    songId: string,
    input: UpdateSongInput,
  ): Promise<Song>;
  delete(organizationId: string, songId: string): Promise<void>;
}
