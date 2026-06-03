import {
  parseAnnouncementSlides,
  type AnnouncementSlide,
} from "./AnnouncementSlide";

export type { AnnouncementSlide };

export type CreateAnnouncementInput = {
  title: string;
  body: string;
  category?: string | null;
  expiresAt?: string | null;
  slides?: AnnouncementSlide[];
};

export type UpdateAnnouncementInput = {
  title?: string;
  body?: string;
  category?: string | null;
  expiresAt?: string | null;
  slides?: AnnouncementSlide[];
};

export type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  category: string | null;
  expires_at: string | null;
  slides?: unknown;
};

export class Announcement {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly body: string,
    readonly category: string | null,
    readonly expiresAt: string | null,
    readonly slides: AnnouncementSlide[],
  ) {}

  static fromRow(row: AnnouncementRow): Announcement {
    return new Announcement(
      row.id,
      row.title,
      row.body,
      row.category,
      row.expires_at,
      parseAnnouncementSlides(row.slides),
    );
  }
}
