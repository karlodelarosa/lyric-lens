import type { SetlistRepository } from "../../domain/setlist/SetlistRepository";

export class PurgeSetlist {
  constructor(private readonly repository: SetlistRepository) {}

  execute(organizationId: string, setlistId: string): Promise<void> {
    return this.repository.purge(organizationId, setlistId);
  }
}
