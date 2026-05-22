import type { Event, UpdateEventInput } from "../../domain/event/Event";
import type { EventRepository } from "../../domain/event/EventRepository";

export class UpdateEvent {
  constructor(private readonly repository: EventRepository) {}

  async execute(
    organizationId: string,
    eventId: string,
    input: UpdateEventInput,
  ): Promise<Event> {
    return this.repository.update(organizationId, eventId, input);
  }
}
