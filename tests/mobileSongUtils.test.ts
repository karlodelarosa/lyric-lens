import { describe, expect, it } from "vitest";
import {
  createMobileSongFormState,
  filterMobileSongs,
  serializeMobileSongForm,
} from "../src/app/lib/mobileSongUtils";

const song = {
  id: "song-1",
  title: "Amazing Grace",
  artist: "Traditional",
  tags: ["hymn", "classic"],
  usageCount: 2,
  backgroundVideoUrl: "https://example.com/song.mp4",
  sections: [
    {
      id: "section-1",
      type: "verse" as const,
      number: 1,
      lyrics: "Amazing grace",
      intensity: 25,
      backgroundVideoUrl: "https://example.com/verse.mp4",
    },
  ],
};

describe("filterMobileSongs", () => {
  it("matches title, artist, and tags without regard to case", () => {
    const anotherSong = {
      ...song,
      id: "song-2",
      title: "Goodness of God",
      artist: "Bethel Music",
      tags: ["worship"],
    };

    expect(filterMobileSongs([song, anotherSong], "grace")).toEqual([song]);
    expect(filterMobileSongs([song, anotherSong], "BETHEL")).toEqual([
      anotherSong,
    ]);
    expect(filterMobileSongs([song, anotherSong], "classic")).toEqual([song]);
  });
});

describe("serializeMobileSongForm", () => {
  it("preserves hidden media and intensity fields while editing core fields", () => {
    const form = createMobileSongFormState(song);
    form.title = "Amazing Grace (Updated)";
    form.sections[0].lyrics = "Updated lyrics";

    expect(serializeMobileSongForm(form, song)).toEqual({
      title: "Amazing Grace (Updated)",
      artist: "Traditional",
      tags: ["hymn", "classic"],
      backgroundVideoUrl: "https://example.com/song.mp4",
      sections: [
        {
          type: "verse",
          number: 1,
          lyrics: "Updated lyrics",
          intensity: 25,
          backgroundVideoUrl: "https://example.com/verse.mp4",
        },
      ],
    });
  });

  it("trims inputs and removes duplicate tags", () => {
    const form = createMobileSongFormState();
    form.title = "  New Song  ";
    form.artist = "  Artist  ";
    form.tags = " worship, new, worship ";
    form.sections[0].lyrics = "  Lyrics  ";

    expect(serializeMobileSongForm(form)).toMatchObject({
      title: "New Song",
      artist: "Artist",
      tags: ["worship", "new"],
      sections: [{ lyrics: "Lyrics" }],
      backgroundVideoUrl: null,
    });
  });

  it("rejects a blank title or a form without lyrics", () => {
    const blankTitle = createMobileSongFormState();
    blankTitle.sections[0].lyrics = "Lyrics";
    expect(() => serializeMobileSongForm(blankTitle)).toThrow(
      "Song title is required",
    );

    const blankLyrics = createMobileSongFormState();
    blankLyrics.title = "Song";
    expect(() => serializeMobileSongForm(blankLyrics)).toThrow(
      "Add lyrics to at least one section",
    );
  });
});
