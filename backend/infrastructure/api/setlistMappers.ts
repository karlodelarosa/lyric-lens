import type { Setlist, SetlistFlowSection } from "../../domain/setlist/Setlist";
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

  return { title, songIds, flowSections };
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

  if (
    input.title === undefined &&
    input.songIds === undefined &&
    input.flowSections === undefined
  ) {
    return null;
  }

  return input;
}
