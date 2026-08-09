import type { TrashedSetlistItem } from "../../domain/setlist/Setlist";
import type { SetlistRepository } from "../../domain/setlist/SetlistRepository";

export class ListTrashedSetlists {
  constructor(private readonly repository: SetlistRepository) {}

  execute(organizationId: string): Promise<TrashedSetlistItem[]> {
    return this.repository.listTrashed(organizationId);
  }
}
