import type { Announcement } from "../../domain/announcement/Announcement";
import type { CreateAnnouncementInput } from "../../domain/announcement/Announcement";
import type { AnnouncementRepository } from "../../domain/announcement/AnnouncementRepository";

export class CreateAnnouncement {
  constructor(private readonly repository: AnnouncementRepository) {}

  execute(
    organizationId: string,
    createdBy: string,
    input: CreateAnnouncementInput,
  ): Promise<Announcement> {
    return this.repository.create(organizationId, createdBy, input);
  }
}
