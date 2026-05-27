import type { Announcement } from "../../domain/announcement/Announcement";
import type { UpdateAnnouncementInput } from "../../domain/announcement/Announcement";
import type { AnnouncementRepository } from "../../domain/announcement/AnnouncementRepository";

export class UpdateAnnouncement {
  constructor(private readonly repository: AnnouncementRepository) {}

  execute(
    organizationId: string,
    announcementId: string,
    input: UpdateAnnouncementInput,
  ): Promise<Announcement> {
    return this.repository.update(organizationId, announcementId, input);
  }
}
