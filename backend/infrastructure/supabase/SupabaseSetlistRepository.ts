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
  flow_sections,
  welcome_slide,
  setlist_songs (
    song_id,
    position
  )
`;

const SETLIST_LIST_SELECT_LEGACY = `
  id,
  title,
  setlist_songs (
    song_id,
    position
  )
`;

const SETLIST_LIST_SELECT_NO_WELCOME = `
  id,
  title,
  flow_sections,
  setlist_songs (
    song_id,
    position
  )
`;

export class SupabaseSetlistRepository implements SetlistRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  private async querySetlists(organizationId: string, select: string) {
    return this.client
      .from("setlists")
      .select(select)
      .eq("organization_id", organizationId)
      .order("title");
  }

  private isMissingFlowSectionsColumn(error: { message?: string } | null) {
    const message = error?.message?.toLowerCase() ?? "";
    return (
      message.includes("flow_sections") &&
      (message.includes("does not exist") || message.includes("could not find"))
    );
  }

  private isMissingWelcomeSlideColumn(error: { message?: string } | null) {
    const message = error?.message?.toLowerCase() ?? "";
    return (
      message.includes("welcome_slide") &&
      (message.includes("does not exist") || message.includes("could not find"))
    );
  }

  async listByOrganization(organizationId: string): Promise<Setlist[]> {
    let { data, error } = await this.querySetlists(
      organizationId,
      SETLIST_LIST_SELECT,
    );

    if (error && this.isMissingFlowSectionsColumn(error)) {
      ({ data, error } = await this.querySetlists(
        organizationId,
        SETLIST_LIST_SELECT_LEGACY,
      ));
    }

    if (error && this.isMissingWelcomeSlideColumn(error)) {
      ({ data, error } = await this.querySetlists(
        organizationId,
        SETLIST_LIST_SELECT_NO_WELCOME,
      ));
    }

    if (error) {
      throw new Error(`Failed to load setlists: ${error.message}`);
    }

    return (data ?? []).map((row) =>
      Setlist.fromListRow(row as unknown as SetlistListRow),
    );
  }

  async create(
    organizationId: string,
    createdBy: string,
    input: CreateSetlistInput,
  ): Promise<Setlist> {
    const baseInsert = {
      organization_id: organizationId,
      title: input.title.trim(),
      created_by: createdBy,
    };

    let { data: setlistRow, error: setlistError } = await this.client
      .from("setlists")
      .insert({
        ...baseInsert,
        flow_sections: input.flowSections ?? [],
        welcome_slide: input.welcomeSlide ?? null,
      })
      .select("id")
      .single();

    if (setlistError && this.isMissingWelcomeSlideColumn(setlistError)) {
      ({ data: setlistRow, error: setlistError } = await this.client
        .from("setlists")
        .insert({
          ...baseInsert,
          flow_sections: input.flowSections ?? [],
        })
        .select("id")
        .single());
    }

    if (setlistError && this.isMissingFlowSectionsColumn(setlistError)) {
      ({ data: setlistRow, error: setlistError } = await this.client
        .from("setlists")
        .insert(baseInsert)
        .select("id")
        .single());
    }

    if (setlistError || !setlistRow) {
      throw new Error(
        `Failed to create setlist: ${setlistError?.message ?? "unknown"}`,
      );
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
    if (
      input.title !== undefined ||
      input.flowSections !== undefined ||
      input.welcomeSlide !== undefined
    ) {
      const patch = {
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.flowSections !== undefined
          ? { flow_sections: input.flowSections }
          : {}),
        ...(input.welcomeSlide !== undefined
          ? { welcome_slide: input.welcomeSlide }
          : {}),
      };

      let { error } = await this.client
        .from("setlists")
        .update(patch)
        .eq("id", setlistId)
        .eq("organization_id", organizationId);

      if (error && this.isMissingWelcomeSlideColumn(error)) {
        const legacyPatch = {
          ...(input.title !== undefined ? { title: input.title.trim() } : {}),
          ...(input.flowSections !== undefined
            ? { flow_sections: input.flowSections }
            : {}),
        };

        if (Object.keys(legacyPatch).length > 0) {
          ({ error } = await this.client
            .from("setlists")
            .update(legacyPatch)
            .eq("id", setlistId)
            .eq("organization_id", organizationId));
        } else {
          error = null;
        }
      }

      if (error && this.isMissingFlowSectionsColumn(error)) {
        const legacyPatch =
          input.title !== undefined ? { title: input.title.trim() } : null;

        if (legacyPatch) {
          ({ error } = await this.client
            .from("setlists")
            .update(legacyPatch)
            .eq("id", setlistId)
            .eq("organization_id", organizationId));
        } else {
          error = null;
        }
      }

      if (error) {
        throw new Error(`Failed to update setlist: ${error.message}`);
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
