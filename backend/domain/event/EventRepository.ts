import type { CreateEventInput, Event, UpdateEventInput } from "./Event";

export interface EventRepository {
  listByOrganization(organizationId: string): Promise<Event[]>;
  create(
    organizationId: string,
    createdBy: string,
    input: CreateEventInput,
  ): Promise<Event>;
  update(
    organizationId: string,
    eventId: string,
    input: UpdateEventInput,
  ): Promise<Event>;
  delete(organizationId: string, eventId: string): Promise<void>;
}
