import type { Announcement } from "../../domain/announcement/Announcement";
import type { AnnouncementRepository } from "../../domain/announcement/AnnouncementRepository";

export class ListAnnouncements {
  constructor(private readonly repository: AnnouncementRepository) {}

  execute(organizationId: string): Promise<Announcement[]> {
    return this.repository.listByOrganization(organizationId);
  }
}
