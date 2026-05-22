import type { Event } from "../../domain/event/Event";
import type {
  CreateEventInput,
  UpdateEventInput,
} from "../../domain/event/Event";

export function eventToDto(event: Event) {
  return {
    id: event.id,
    title: event.title,
    date: event.date,
    setlistId: event.setlistId,
  };
}

function parseDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function parseSetlistId(value: unknown): string | null | undefined {
  if (value === null || value === undefined || value === "") return null;
  return typeof value === "string" ? value : undefined;
}

export function parseCreateEventBody(body: unknown): CreateEventInput | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const eventDate =
    parseDate(record.eventDate) ?? parseDate(record.date) ?? null;

  if (!title || !eventDate) return null;

  const setlistId = parseSetlistId(record.setlistId);

  return {
    title,
    eventDate,
    setlistId: setlistId === undefined ? null : setlistId,
  };
}

export function parseUpdateEventBody(body: unknown): UpdateEventInput | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const input: UpdateEventInput = {};

  if (typeof record.title === "string") {
    const title = record.title.trim();
    if (!title) return null;
    input.title = title;
  }

  const eventDate =
    parseDate(record.eventDate) ?? parseDate(record.date) ?? undefined;
  if (record.eventDate !== undefined || record.date !== undefined) {
    if (!eventDate) return null;
    input.eventDate = eventDate;
  }

  if ("setlistId" in record) {
    const setlistId = parseSetlistId(record.setlistId);
    if (setlistId === undefined) return null;
    input.setlistId = setlistId;
  }

  if (
    input.title === undefined &&
    input.eventDate === undefined &&
    input.setlistId === undefined
  ) {
    return null;
  }

  return input;
}
