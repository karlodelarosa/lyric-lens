import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Announcement,
  type AnnouncementRow,
  type CreateAnnouncementInput,
  type UpdateAnnouncementInput,
} from "../../domain/announcement/Announcement";
import type { AnnouncementRepository } from "../../domain/announcement/AnnouncementRepository";
import type { Database } from "./database.types";

const ANNOUNCEMENT_SELECT = "id, title, body, category, expires_at";

export class SupabaseAnnouncementRepository implements AnnouncementRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listByOrganization(organizationId: string): Promise<Announcement[]> {
    const { data, error } = await this.client
      .from("announcements")
      .select(ANNOUNCEMENT_SELECT)
      .eq("organization_id", organizationId)
      .order("title");

    if (error) {
      throw new Error(`Failed to load announcements: ${error.message}`);
    }

    return (data ?? []).map((row) =>
      Announcement.fromRow(row as AnnouncementRow),
    );
  }

  async create(
    organizationId: string,
    createdBy: string,
    input: CreateAnnouncementInput,
  ): Promise<Announcement> {
    const { data, error } = await this.client
      .from("announcements")
      .insert({
        organization_id: organizationId,
        title: input.title.trim(),
        body: input.body,
        category: input.category?.trim() || null,
        expires_at: input.expiresAt ?? null,
        created_by: createdBy,
      })
      .select(ANNOUNCEMENT_SELECT)
      .single();

    if (error || !data) {
      throw new Error(
        `Failed to create announcement: ${error?.message ?? "unknown"}`,
      );
    }

    return Announcement.fromRow(data as AnnouncementRow);
  }

  async update(
    organizationId: string,
    announcementId: string,
    input: UpdateAnnouncementInput,
  ): Promise<Announcement> {
    const patch: Database["public"]["Tables"]["announcements"]["Update"] = {
      updated_at: new Date().toISOString(),
    };

    if (input.title !== undefined) patch.title = input.title.trim();
    if (input.body !== undefined) patch.body = input.body;
    if (input.category !== undefined) {
      patch.category = input.category?.trim() || null;
    }
    if (input.expiresAt !== undefined) patch.expires_at = input.expiresAt;

    const { data, error } = await this.client
      .from("announcements")
      .update(patch)
      .eq("id", announcementId)
      .eq("organization_id", organizationId)
      .select(ANNOUNCEMENT_SELECT)
      .single();

    if (error || !data) {
      throw new Error(
        `Failed to update announcement: ${error?.message ?? "unknown"}`,
      );
    }

    return Announcement.fromRow(data as AnnouncementRow);
  }

  async delete(organizationId: string, announcementId: string): Promise<void> {
    const { error } = await this.client
      .from("announcements")
      .delete()
      .eq("id", announcementId)
      .eq("organization_id", organizationId);

    if (error) {
      throw new Error("Failed to delete announcement");
    }
  }
}
