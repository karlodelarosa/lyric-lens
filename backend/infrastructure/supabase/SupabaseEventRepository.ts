import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Event,
  type CreateEventInput,
  type EventRow,
  type UpdateEventInput,
} from "../../domain/event/Event";
import type { EventRepository } from "../../domain/event/EventRepository";
import type { Database } from "./database.types";

export class SupabaseEventRepository implements EventRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listByOrganization(organizationId: string): Promise<Event[]> {
    const { data, error } = await this.client
      .from("events")
      .select("id, title, event_date, setlist_id")
      .eq("organization_id", organizationId)
      .order("event_date", { ascending: false });

    if (error) {
      throw new Error("Failed to load events");
    }

    return (data ?? []).map((row) => Event.fromRow(row as EventRow));
  }

  async create(
    organizationId: string,
    createdBy: string,
    input: CreateEventInput,
  ): Promise<Event> {
    const { data, error } = await this.client
      .from("events")
      .insert({
        organization_id: organizationId,
        title: input.title.trim(),
        event_date: input.eventDate,
        setlist_id: input.setlistId ?? null,
        created_by: createdBy,
      })
      .select("id, title, event_date, setlist_id")
      .single();

    if (error || !data) {
      throw new Error("Failed to create event");
    }

    return Event.fromRow(data as EventRow);
  }

  async update(
    organizationId: string,
    eventId: string,
    input: UpdateEventInput,
  ): Promise<Event> {
    const updates: Database["public"]["Tables"]["events"]["Update"] = {};

    if (input.title !== undefined) updates.title = input.title.trim();
    if (input.eventDate !== undefined) updates.event_date = input.eventDate;
    if (input.setlistId !== undefined) updates.setlist_id = input.setlistId;

    const { data, error } = await this.client
      .from("events")
      .update(updates)
      .eq("id", eventId)
      .eq("organization_id", organizationId)
      .select("id, title, event_date, setlist_id")
      .single();

    if (error || !data) {
      throw new Error("Failed to update event");
    }

    return Event.fromRow(data as EventRow);
  }

  async delete(organizationId: string, eventId: string): Promise<void> {
    const { error } = await this.client
      .from("events")
      .delete()
      .eq("id", eventId)
      .eq("organization_id", organizationId);

    if (error) {
      throw new Error("Failed to delete event");
    }
  }
}
