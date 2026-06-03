import {
  parseAnnouncementSlides,
  type AnnouncementSlide,
} from "../announcement/AnnouncementSlide";

export type ServiceFlowSegmentKind = "music" | "announcements" | "cue";

export type ServiceFlowSegmentInput = {
  label: string;
  kind: ServiceFlowSegmentKind;
  notes?: string | null;
  setlistId?: string | null;
  announcementIds?: string[];
};

export type CreateServiceFlowInput = {
  title: string;
  description?: string | null;
  segments: ServiceFlowSegmentInput[];
};

export type UpdateServiceFlowInput = {
  title?: string;
  description?: string | null;
  segments?: ServiceFlowSegmentInput[];
};

export type ServiceFlowSegmentAnnouncementRow = {
  announcement_id: string;
  position: number;
  announcements: {
    id: string;
    title: string;
    body: string;
    category: string | null;
    expires_at: string | null;
    slides?: unknown;
  } | null;
};

export type ServiceFlowSegmentRow = {
  id: string;
  position: number;
  label: string;
  kind: ServiceFlowSegmentKind;
  notes: string | null;
  setlist_id: string | null;
  setlists: { id: string; title: string } | null;
  service_flow_segment_announcements:
    | ServiceFlowSegmentAnnouncementRow[]
    | null;
};

export type ServiceFlowListRow = {
  id: string;
  title: string;
  description: string | null;
  service_flow_segments: { id: string }[] | null;
};

export type ServiceFlowDetailRow = {
  id: string;
  title: string;
  description: string | null;
  service_flow_segments: ServiceFlowSegmentRow[] | null;
};

export type ServiceFlowSegmentAnnouncement = {
  id: string;
  title: string;
  body: string;
  category: string | null;
  expiresAt: string | null;
  slides: AnnouncementSlide[];
};

export type ServiceFlowSegment = {
  id: string;
  position: number;
  label: string;
  kind: ServiceFlowSegmentKind;
  notes: string | null;
  setlistId: string | null;
  setlistName: string | null;
  announcements: ServiceFlowSegmentAnnouncement[];
};

export class ServiceFlow {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly description: string | null,
    readonly segments: ServiceFlowSegment[],
  ) {}

  static fromListRow(row: ServiceFlowListRow): ServiceFlow {
    return new ServiceFlow(row.id, row.title, row.description, []);
  }

  static fromDetailRow(row: ServiceFlowDetailRow): ServiceFlow {
    const segments = (row.service_flow_segments ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((segment) => ServiceFlow.segmentFromRow(segment));

    return new ServiceFlow(row.id, row.title, row.description, segments);
  }

  private static segmentFromRow(
    row: ServiceFlowSegmentRow,
  ): ServiceFlowSegment {
    const announcements = (row.service_flow_segment_announcements ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((link) => link.announcements)
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        category: item.category,
        expiresAt: item.expires_at,
        slides: parseAnnouncementSlides(item.slides),
      }));

    return {
      id: row.id,
      position: row.position,
      label: row.label,
      kind: row.kind,
      notes: row.notes,
      setlistId: row.setlist_id,
      setlistName: row.setlists?.title ?? null,
      announcements,
    };
  }
}

export type ServiceFlowListItem = {
  id: string;
  title: string;
  description: string | null;
  segmentCount: number;
};
