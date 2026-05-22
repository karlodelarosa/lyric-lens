import type { SetlistRepository } from "../../domain/setlist/SetlistRepository";

export class DeleteSetlist {
  constructor(private readonly repository: SetlistRepository) {}

  async execute(organizationId: string, setlistId: string): Promise<void> {
    return this.repository.delete(organizationId, setlistId);
  }
}
