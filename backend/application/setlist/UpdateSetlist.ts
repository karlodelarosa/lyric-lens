import type { Setlist, UpdateSetlistInput } from "../../domain/setlist/Setlist";
import type { SetlistRepository } from "../../domain/setlist/SetlistRepository";

export class UpdateSetlist {
  constructor(private readonly repository: SetlistRepository) {}

  async execute(
    organizationId: string,
    setlistId: string,
    input: UpdateSetlistInput,
  ): Promise<Setlist> {
    return this.repository.update(organizationId, setlistId, input);
  }
}
