import type { CreateEventInput, Event } from "../../domain/event/Event";
import type { EventRepository } from "../../domain/event/EventRepository";

export class CreateEvent {
  constructor(private readonly repository: EventRepository) {}

  async execute(
    organizationId: string,
    createdBy: string,
    input: CreateEventInput,
  ): Promise<Event> {
    return this.repository.create(organizationId, createdBy, input);
  }
}
