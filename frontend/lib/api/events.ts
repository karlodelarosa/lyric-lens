import { apiDelete, apiGet, apiPatch, apiPost } from "./client";

export type EventDto = {
  id: string;
  title: string;
  date: string;
  setlistId?: string;
};

export type EventsResponse = {
  events: EventDto[];
};

export type CreateEventPayload = {
  title: string;
  date: string;
  setlistId?: string | null;
};

export type UpdateEventPayload = {
  title?: string;
  date?: string;
  setlistId?: string | null;
};

export async function getEvents(
  organizationId: string,
): Promise<EventsResponse> {
  return apiGet<EventsResponse>(`/api/organizations/${organizationId}/events`);
}

export async function createEvent(
  organizationId: string,
  payload: CreateEventPayload,
): Promise<{ event: EventDto }> {
  return apiPost<{ event: EventDto }>(
    `/api/organizations/${organizationId}/events`,
    payload,
  );
}

export async function updateEvent(
  organizationId: string,
  eventId: string,
  payload: UpdateEventPayload,
): Promise<{ event: EventDto }> {
  return apiPatch<{ event: EventDto }>(
    `/api/organizations/${organizationId}/events/${eventId}`,
    payload,
  );
}

export async function deleteEvent(
  organizationId: string,
  eventId: string,
): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(
    `/api/organizations/${organizationId}/events/${eventId}`,
  );
}
