import type {
  Setlist,
  SetlistFlowSection,
  WelcomeSlide,
} from "../../domain/setlist/Setlist";
import type {
  CreateSetlistInput,
  UpdateSetlistInput,
} from "../../domain/setlist/Setlist";

export function setlistToDto(setlist: Setlist) {
  return {
    id: setlist.id,
    name: setlist.name,
    songs: setlist.songs,
    flowSections: setlist.flowSections,
    welcomeSlide: setlist.welcomeSlide,
    updatedAt: setlist.updatedAt,
  };
}

function parseFlowSections(value: unknown): SetlistFlowSection[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const sections: SetlistFlowSection[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return undefined;
    const record = item as Record<string, unknown>;
    const name = typeof record.name === "string" ? record.name.trim() : "";
    const songIds = Array.isArray(record.songIds)
      ? record.songIds.filter((id): id is string => typeof id === "string")
      : [];
    if (!name) return undefined;
    sections.push({ name, songIds });
  }

  return sections;
}

function parseWelcomeSlide(value: unknown): WelcomeSlide | null | undefined {
  if (value === null) return null;
  if (value === undefined) return undefined;
  if (!value || typeof value !== "object") return undefined;

  const record = value as Record<string, unknown>;
  const url = typeof record.url === "string" ? record.url.trim() : "";
  const type =
    record.type === "video"
      ? "video"
      : record.type === "image"
        ? "image"
        : null;

  if (!url || !type) return undefined;
  return { url, type };
}

export function parseCreateSetlistBody(
  body: unknown,
): CreateSetlistInput | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";

  if (!title) return null;

  const songIds = Array.isArray(record.songIds)
    ? record.songIds.filter((id): id is string => typeof id === "string")
    : [];

  const flowSections = parseFlowSections(record.flowSections);
  const welcomeSlide = parseWelcomeSlide(record.welcomeSlide);

  return {
    title,
    songIds,
    flowSections,
    ...(welcomeSlide !== undefined ? { welcomeSlide } : {}),
  };
}

export function parseUpdateSetlistBody(
  body: unknown,
): UpdateSetlistInput | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const input: UpdateSetlistInput = {};

  if (typeof record.title === "string") {
    const title = record.title.trim();
    if (!title) return null;
    input.title = title;
  }

  if (Array.isArray(record.songIds)) {
    input.songIds = record.songIds.filter(
      (id): id is string => typeof id === "string",
    );
  }

  const flowSections = parseFlowSections(record.flowSections);
  if (flowSections !== undefined) {
    input.flowSections = flowSections;
  }

  const welcomeSlide = parseWelcomeSlide(record.welcomeSlide);
  if (welcomeSlide !== undefined) {
    input.welcomeSlide = welcomeSlide;
  }

  if (
    input.title === undefined &&
    input.songIds === undefined &&
    input.flowSections === undefined &&
    input.welcomeSlide === undefined
  ) {
    return null;
  }

  return input;
}
