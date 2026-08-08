import { describe, expect, it } from "vitest";
import {
  collectSongIdsFromSetlist,
  dedupeSongsById,
  type OfflineSetlist,
  type OfflineSong,
} from "../src/app/lib/offlineCache";

const sampleSetlist: OfflineSetlist = {
  id: "setlist-1",
  name: "Sunday AM",
  songs: ["song-a", "song-b"],
  flowSections: [
    { name: "Worship", songIds: ["song-b", "song-c"] },
    { name: "Response", songIds: ["song-d"] },
  ],
  welcomeSlide: null,
};

const sampleSongs: OfflineSong[] = [
  {
    id: "song-a",
    title: "Song A",
    artist: "Artist",
    sections: [{ id: "sec-a", type: "verse", lyrics: "Line one" }],
    tags: [],
    usageCount: 1,
    backgroundVideoUrl: null,
  },
  {
    id: "song-b",
    title: "Song B",
    artist: "Artist",
    sections: [{ id: "sec-b", type: "chorus", lyrics: "Chorus" }],
    tags: [],
    usageCount: 2,
    backgroundVideoUrl: null,
  },
];

describe("offlineCache helpers", () => {
  it("collects song ids from setlist order and flow sections", () => {
    expect(collectSongIdsFromSetlist(sampleSetlist)).toEqual([
      "song-a",
      "song-b",
      "song-c",
      "song-d",
    ]);
  });

  it("dedupes songs by id", () => {
    const deduped = dedupeSongsById([...sampleSongs, sampleSongs[0]]);
    expect(deduped).toHaveLength(2);
    expect(deduped.map((song) => song.id)).toEqual(["song-a", "song-b"]);
  });
});
