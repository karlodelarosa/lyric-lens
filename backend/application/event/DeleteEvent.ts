import type { EventRepository } from "../../domain/event/EventRepository";

export class DeleteEvent {
  constructor(private readonly repository: EventRepository) {}

  async execute(organizationId: string, eventId: string): Promise<void> {
    return this.repository.delete(organizationId, eventId);
  }
}
