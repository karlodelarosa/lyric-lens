import type { Setlist } from "../../domain/setlist/Setlist";
import type {
  CreateSetlistInput,
  UpdateSetlistInput,
} from "../../domain/setlist/Setlist";

export function setlistToDto(setlist: Setlist) {
  return {
    id: setlist.id,
    name: setlist.name,
    songs: setlist.songs,
  };
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

  return { title, songIds };
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

  if (input.title === undefined && input.songIds === undefined) {
    return null;
  }

  return input;
}
