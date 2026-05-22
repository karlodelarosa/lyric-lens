import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Setlist,
  type CreateSetlistInput,
  type SetlistListRow,
  type UpdateSetlistInput,
} from "../../domain/setlist/Setlist";
import type { SetlistRepository } from "../../domain/setlist/SetlistRepository";
import type { Database } from "./database.types";

const SETLIST_LIST_SELECT = `
  id,
  title,
  setlist_songs (
    song_id,
    position
  )
`;

export class SupabaseSetlistRepository implements SetlistRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listByOrganization(organizationId: string): Promise<Setlist[]> {
    const { data, error } = await this.client
      .from("setlists")
      .select(SETLIST_LIST_SELECT)
      .eq("organization_id", organizationId)
      .order("title");

    if (error) {
      throw new Error("Failed to load setlists");
    }

    return (data ?? []).map((row) =>
      Setlist.fromListRow(row as SetlistListRow),
    );
  }

  async create(
    organizationId: string,
    createdBy: string,
    input: CreateSetlistInput,
  ): Promise<Setlist> {
    const { data: setlistRow, error: setlistError } = await this.client
      .from("setlists")
      .insert({
        organization_id: organizationId,
        title: input.title.trim(),
        created_by: createdBy,
      })
      .select("id")
      .single();

    if (setlistError || !setlistRow) {
      throw new Error("Failed to create setlist");
    }

    await this.replaceSongs(setlistRow.id, input.songIds);

    const setlists = await this.listByOrganization(organizationId);
    const created = setlists.find((setlist) => setlist.id === setlistRow.id);

    if (!created) {
      throw new Error("Failed to load created setlist");
    }

    return created;
  }

  async update(
    organizationId: string,
    setlistId: string,
    input: UpdateSetlistInput,
  ): Promise<Setlist> {
    if (input.title !== undefined) {
      const { error } = await this.client
        .from("setlists")
        .update({ title: input.title.trim() })
        .eq("id", setlistId)
        .eq("organization_id", organizationId);

      if (error) {
        throw new Error("Failed to update setlist");
      }
    }

    if (input.songIds !== undefined) {
      await this.replaceSongs(setlistId, input.songIds);
    }

    const setlists = await this.listByOrganization(organizationId);
    const updated = setlists.find((setlist) => setlist.id === setlistId);

    if (!updated) {
      throw new Error("Failed to load updated setlist");
    }

    return updated;
  }

  async delete(organizationId: string, setlistId: string): Promise<void> {
    const { error } = await this.client
      .from("setlists")
      .delete()
      .eq("id", setlistId)
      .eq("organization_id", organizationId);

    if (error) {
      throw new Error("Failed to delete setlist");
    }
  }

  private async replaceSongs(setlistId: string, songIds: string[]) {
    const { error: deleteError } = await this.client
      .from("setlist_songs")
      .delete()
      .eq("setlist_id", setlistId);

    if (deleteError) {
      throw new Error("Failed to update setlist songs");
    }

    const uniqueSongIds = [...new Set(songIds)];
    if (uniqueSongIds.length === 0) return;

    const { error: insertError } = await this.client
      .from("setlist_songs")
      .insert(
        uniqueSongIds.map((songId, index) => ({
          setlist_id: setlistId,
          song_id: songId,
          position: index,
        })),
      );

    if (insertError) {
      throw new Error("Failed to update setlist songs");
    }
  }
}
