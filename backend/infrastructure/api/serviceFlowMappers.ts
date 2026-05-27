import type {
  ServiceFlow,
  ServiceFlowListItem,
} from "../../domain/serviceFlow/ServiceFlow";
import type {
  CreateServiceFlowInput,
  ServiceFlowSegmentInput,
  ServiceFlowSegmentKind,
  UpdateServiceFlowInput,
} from "../../domain/serviceFlow/ServiceFlow";

const SEGMENT_KINDS: ServiceFlowSegmentKind[] = [
  "music",
  "announcements",
  "cue",
];

function parseSegmentKind(value: unknown): ServiceFlowSegmentKind | null {
  if (typeof value !== "string") return null;
  return SEGMENT_KINDS.includes(value as ServiceFlowSegmentKind)
    ? (value as ServiceFlowSegmentKind)
    : null;
}

function parseSegments(value: unknown): ServiceFlowSegmentInput[] | null {
  if (!Array.isArray(value)) return null;

  const segments: ServiceFlowSegmentInput[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const record = item as Record<string, unknown>;
    const label = typeof record.label === "string" ? record.label.trim() : "";
    const kind = parseSegmentKind(record.kind);

    if (!label || !kind) return null;

    const notes =
      typeof record.notes === "string"
        ? record.notes
        : record.notes === null
          ? null
          : undefined;

    const setlistId =
      record.setlistId === null
        ? null
        : typeof record.setlistId === "string"
          ? record.setlistId
          : undefined;

    const announcementIds = Array.isArray(record.announcementIds)
      ? record.announcementIds.filter(
          (id): id is string => typeof id === "string",
        )
      : undefined;

    segments.push({
      label,
      kind,
      notes,
      setlistId,
      announcementIds,
    });
  }

  return segments;
}

export function serviceFlowListItemToDto(item: ServiceFlowListItem) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    segmentCount: item.segmentCount,
  };
}

export function serviceFlowToDto(flow: ServiceFlow) {
  return {
    id: flow.id,
    title: flow.title,
    description: flow.description,
    segments: flow.segments.map((segment) => ({
      id: segment.id,
      position: segment.position,
      label: segment.label,
      kind: segment.kind,
      notes: segment.notes,
      setlistId: segment.setlistId,
      setlistName: segment.setlistName,
      announcements: segment.announcements.map((announcement) => ({
        id: announcement.id,
        title: announcement.title,
        body: announcement.body,
        category: announcement.category,
        expiresAt: announcement.expiresAt,
      })),
    })),
  };
}

export function parseCreateServiceFlowBody(
  body: unknown,
): CreateServiceFlowInput | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  if (!title) return null;

  const segments = parseSegments(record.segments);
  if (!segments) return null;

  const description =
    typeof record.description === "string"
      ? record.description
      : record.description === null
        ? null
        : undefined;

  return { title, description, segments };
}

export function parseUpdateServiceFlowBody(
  body: unknown,
): UpdateServiceFlowInput | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const input: UpdateServiceFlowInput = {};

  if (typeof record.title === "string") {
    const title = record.title.trim();
    if (!title) return null;
    input.title = title;
  }

  if (record.description === null) {
    input.description = null;
  } else if (typeof record.description === "string") {
    input.description = record.description;
  }

  if (record.segments !== undefined) {
    const segments = parseSegments(record.segments);
    if (!segments) return null;
    input.segments = segments;
  }

  if (
    input.title === undefined &&
    input.description === undefined &&
    input.segments === undefined
  ) {
    return null;
  }

  return input;
}
