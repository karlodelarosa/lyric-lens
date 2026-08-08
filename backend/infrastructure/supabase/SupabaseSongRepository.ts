import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Song,
  type CreateSongInput,
  type SongListRow,
  type UpdateSongInput,
} from "../../domain/song/Song";
import type { SongRepository } from "../../domain/song/SongRepository";
import type { Database } from "./database.types";

const SONG_LIST_SELECT = `
  id,
  title,
  artist,
  background_video_url,
  song_sections (
    id,
    section_type,
    section_number,
    content,
    position,
    intensity
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

    const usageCounts = await this.loadUsageCounts(organizationId);

    return (data ?? []).map((row) => {
      const song = Song.fromListRow(row as SongListRow);
      return Song.withUsageCount(song, usageCounts.get(song.id) ?? 0);
    });
  }

  private async loadUsageCounts(
    organizationId: string,
  ): Promise<Map<string, number>> {
    const { data: setlists, error: setlistsError } = await this.client
      .from("setlists")
      .select("id")
      .eq("organization_id", organizationId);

    if (setlistsError || !setlists?.length) {
      return new Map();
    }

    const setlistIds = setlists.map((row) => row.id);
    const { data: links, error: linksError } = await this.client
      .from("setlist_songs")
      .select("song_id")
      .in("setlist_id", setlistIds);

    if (linksError) {
      return new Map();
    }

    const counts = new Map<string, number>();
    for (const link of links ?? []) {
      counts.set(link.song_id, (counts.get(link.song_id) ?? 0) + 1);
    }

    return counts;
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
        background_video_url: input.backgroundVideoUrl?.trim() || null,
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
      intensity: section.intensity ?? null,
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

  async update(
    organizationId: string,
    songId: string,
    input: UpdateSongInput,
  ): Promise<Song> {
    const { error: songError } = await this.client
      .from("songs")
      .update({
        title: input.title.trim(),
        artist: input.artist.trim() || null,
        background_video_url: input.backgroundVideoUrl?.trim() || null,
      })
      .eq("id", songId)
      .eq("organization_id", organizationId);

    if (songError) {
      throw new Error("Failed to update song");
    }

    const { error: deleteSectionsError } = await this.client
      .from("song_sections")
      .delete()
      .eq("song_id", songId);

    if (deleteSectionsError) {
      throw new Error("Failed to update song sections");
    }

    const sectionRows = input.sections.map((section, index) => ({
      song_id: songId,
      section_type: section.type,
      section_number: section.number ?? null,
      content: section.lyrics.trim(),
      position: index,
      intensity: section.intensity ?? null,
    }));

    const { error: sectionsError } = await this.client
      .from("song_sections")
      .insert(sectionRows);

    if (sectionsError) {
      throw new Error("Failed to update song sections");
    }

    const { error: deleteLinksError } = await this.client
      .from("song_tag_links")
      .delete()
      .eq("song_id", songId);

    if (deleteLinksError) {
      throw new Error("Failed to update song tags");
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
        throw new Error("Failed to update song tags");
      }

      const { error: linksError } = await this.client
        .from("song_tag_links")
        .insert(tagRows.map((tag) => ({ song_id: songId, tag_id: tag.id })));

      if (linksError) {
        throw new Error("Failed to link song tags");
      }
    }

    const songs = await this.listByOrganization(organizationId);
    const updated = songs.find((song) => song.id === songId);

    if (!updated) {
      throw new Error("Failed to load updated song");
    }

    return updated;
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
