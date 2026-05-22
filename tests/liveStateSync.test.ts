import { describe, expect, it } from "vitest";
import { buildLiveUrl } from "../src/app/lib/liveStateSync";

describe("liveStateSync", () => {
  it("builds live url without setlist", () => {
    expect(buildLiveUrl()).toBe("/live");
    expect(buildLiveUrl(null)).toBe("/live");
  });

  it("builds live url with setlist id", () => {
    expect(buildLiveUrl("abc-123")).toBe("/live?setlistId=abc-123");
  });
});
