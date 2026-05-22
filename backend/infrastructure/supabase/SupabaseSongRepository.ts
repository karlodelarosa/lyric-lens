import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Song,
  type CreateSongInput,
  type SongListRow,
} from "../../domain/song/Song";
import type { SongRepository } from "../../domain/song/SongRepository";
import type { Database } from "./database.types";

const SONG_LIST_SELECT = `
  id,
  title,
  artist,
  song_sections (
    id,
    section_type,
    section_number,
    content,
    position
  ),
  song_tag_links (
    song_tags (
      name
    )
  )
`;

export class SupabaseSongRepository implements SongRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listByOrganization(organizationId: string): Promise<Song[]> {
    const { data, error } = await this.client
      .from("songs")
      .select(SONG_LIST_SELECT)
      .eq("organization_id", organizationId)
      .order("title");

    if (error) {
      throw new Error("Failed to load songs");
    }

    return (data ?? []).map((row) => Song.fromListRow(row as SongListRow));
  }

  async create(
    organizationId: string,
    createdBy: string,
    input: CreateSongInput,
  ): Promise<Song> {
    const { data: songRow, error: songError } = await this.client
      .from("songs")
      .insert({
        organization_id: organizationId,
        title: input.title.trim(),
        artist: input.artist.trim() || null,
        created_by: createdBy,
      })
      .select("id")
      .single();

    if (songError || !songRow) {
      throw new Error("Failed to create song");
    }

    const songId = songRow.id;

    const sectionRows = input.sections.map((section, index) => ({
      song_id: songId,
      section_type: section.type,
      section_number: section.number ?? null,
      content: section.lyrics.trim(),
      position: index,
    }));

    const { error: sectionsError } = await this.client
      .from("song_sections")
      .insert(sectionRows);

    if (sectionsError) {
      await this.client.from("songs").delete().eq("id", songId);
      throw new Error("Failed to create song sections");
    }

    const tagNames = [
      ...new Set(
        input.tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0),
      ),
    ];

    if (tagNames.length > 0) {
      const { data: tagRows, error: tagsError } = await this.client
        .from("song_tags")
        .upsert(
          tagNames.map((name) => ({
            organization_id: organizationId,
            name,
          })),
          { onConflict: "organization_id,name" },
        )
        .select("id");

      if (tagsError || !tagRows?.length) {
        await this.client.from("songs").delete().eq("id", songId);
        throw new Error("Failed to create song tags");
      }

      const { error: linksError } = await this.client
        .from("song_tag_links")
        .insert(tagRows.map((tag) => ({ song_id: songId, tag_id: tag.id })));

      if (linksError) {
        await this.client.from("songs").delete().eq("id", songId);
        throw new Error("Failed to link song tags");
      }
    }

    const songs = await this.listByOrganization(organizationId);
    const created = songs.find((song) => song.id === songId);

    if (!created) {
      throw new Error("Failed to load created song");
    }

    return created;
  }

  async delete(organizationId: string, songId: string): Promise<void> {
    const { error } = await this.client
      .from("songs")
      .delete()
      .eq("id", songId)
      .eq("organization_id", organizationId);

    if (error) {
      throw new Error("Failed to delete song");
    }
  }
}
