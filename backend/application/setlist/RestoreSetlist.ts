import type { SetlistRepository } from "../../domain/setlist/SetlistRepository";

export class RestoreSetlist {
  constructor(private readonly repository: SetlistRepository) {}

  execute(organizationId: string, setlistId: string): Promise<void> {
    return this.repository.restore(organizationId, setlistId);
  }
}
