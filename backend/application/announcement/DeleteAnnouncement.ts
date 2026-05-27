import type { AnnouncementRepository } from "../../domain/announcement/AnnouncementRepository";

export class DeleteAnnouncement {
  constructor(private readonly repository: AnnouncementRepository) {}

  execute(organizationId: string, announcementId: string): Promise<void> {
    return this.repository.delete(organizationId, announcementId);
  }
}
