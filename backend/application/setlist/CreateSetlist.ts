import type { CreateSetlistInput, Setlist } from "../../domain/setlist/Setlist";
import type { SetlistRepository } from "../../domain/setlist/SetlistRepository";

export class CreateSetlist {
  constructor(private readonly repository: SetlistRepository) {}

  async execute(
    organizationId: string,
    createdBy: string,
    input: CreateSetlistInput,
  ): Promise<Setlist> {
    return this.repository.create(organizationId, createdBy, input);
  }
}
