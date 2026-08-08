import { describe, expect, it } from "vitest";
import {
  parseCreateSongBody,
  parseUpdateSongBody,
} from "../backend/infrastructure/api/songMappers";

describe("songMappers", () => {
  it("parses valid create song payload", () => {
    const input = parseCreateSongBody({
      title: "Amazing Grace",
      artist: "Traditional",
      tags: ["hymn"],
      sections: [{ type: "verse", number: 1, lyrics: "Amazing grace" }],
    });

    expect(input).toEqual({
      title: "Amazing Grace",
      artist: "Traditional",
      tags: ["hymn"],
      sections: [
        {
          type: "verse",
          number: 1,
          lyrics: "Amazing grace",
          intensity: null,
        },
      ],
      backgroundVideoUrl: null,
    });
  });

  it("rejects create payload without sections", () => {
    expect(
      parseCreateSongBody({
        title: "Test",
        artist: "Artist",
        tags: [],
        sections: [],
      }),
    ).toBeNull();
  });

  it("uses same parser for update", () => {
    expect(parseUpdateSongBody).toBe(parseCreateSongBody);
  });
});
