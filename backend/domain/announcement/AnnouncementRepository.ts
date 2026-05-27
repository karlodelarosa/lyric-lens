import type { Announcement } from "./Announcement";
import type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "./Announcement";

export interface AnnouncementRepository {
  listByOrganization(organizationId: string): Promise<Announcement[]>;
  create(
    organizationId: string,
    createdBy: string,
    input: CreateAnnouncementInput,
  ): Promise<Announcement>;
  update(
    organizationId: string,
    announcementId: string,
    input: UpdateAnnouncementInput,
  ): Promise<Announcement>;
  delete(organizationId: string, announcementId: string): Promise<void>;
}
