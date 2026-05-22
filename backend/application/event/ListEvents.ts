import type { Event } from "../../domain/event/Event";
import type { EventRepository } from "../../domain/event/EventRepository";

export class ListEvents {
  constructor(private readonly repository: EventRepository) {}

  async execute(organizationId: string): Promise<Event[]> {
    return this.repository.listByOrganization(organizationId);
  }
}
