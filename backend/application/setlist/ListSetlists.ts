import type { Setlist } from "../../domain/setlist/Setlist";
import type { SetlistRepository } from "../../domain/setlist/SetlistRepository";

export class ListSetlists {
  constructor(private readonly repository: SetlistRepository) {}

  async execute(organizationId: string): Promise<Setlist[]> {
    return this.repository.listByOrganization(organizationId);
  }
}
