import type {
  CreateSetlistInput,
  Setlist,
  TrashedSetlistItem,
  UpdateSetlistInput,
} from "./Setlist";

export interface SetlistRepository {
  listByOrganization(organizationId: string): Promise<Setlist[]>;
  create(
    organizationId: string,
    createdBy: string,
    input: CreateSetlistInput,
  ): Promise<Setlist>;
  update(
    organizationId: string,
    setlistId: string,
    input: UpdateSetlistInput,
  ): Promise<Setlist>;
  delete(organizationId: string, setlistId: string): Promise<void>;
  listTrashed(organizationId: string): Promise<TrashedSetlistItem[]>;
  restore(organizationId: string, setlistId: string): Promise<void>;
  purge(organizationId: string, setlistId: string): Promise<void>;
}
