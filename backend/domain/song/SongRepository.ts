import type {
  CreateSongInput,
  Song,
  TrashedSongItem,
  UpdateSongInput,
} from "./Song";

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
  listTrashed(organizationId: string): Promise<TrashedSongItem[]>;
  restore(organizationId: string, songId: string): Promise<void>;
  purge(organizationId: string, songId: string): Promise<void>;
}
