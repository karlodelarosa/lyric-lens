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

  it("builds live url with service flow id", () => {
    expect(buildLiveUrl({ serviceFlowId: "flow-456" })).toBe(
      "/live?serviceFlowId=flow-456",
    );
  });

  it("prefers service flow id over setlist id", () => {
    expect(
      buildLiveUrl({ serviceFlowId: "flow-456", setlistId: "abc-123" }),
    ).toBe("/live?serviceFlowId=flow-456");
  });
});
