import { describe, expect, it } from "vitest";
import {
  buildWelcomeSlideStoragePath,
  getWelcomeSlideExtension,
  getWelcomeSlideMediaType,
  isAllowedWelcomeSlideMimeType,
  WELCOME_SLIDE_MAX_BYTES,
} from "../backend/domain/setlist/welcomeSlideUpload";

describe("welcomeSlideUpload", () => {
  it("uses a 20 MB limit", () => {
    expect(WELCOME_SLIDE_MAX_BYTES).toBe(20 * 1024 * 1024);
  });

  it("detects image and video mime types", () => {
    expect(getWelcomeSlideMediaType("image/png")).toBe("image");
    expect(getWelcomeSlideMediaType("video/mp4")).toBe("video");
    expect(getWelcomeSlideMediaType("application/pdf")).toBeNull();
  });

  it("validates allowed mime types", () => {
    expect(isAllowedWelcomeSlideMimeType("image/jpeg")).toBe(true);
    expect(isAllowedWelcomeSlideMimeType("text/plain")).toBe(false);
  });

  it("resolves extensions from mime type or filename", () => {
    expect(getWelcomeSlideExtension("image/png")).toBe("png");
    expect(
      getWelcomeSlideExtension("application/octet-stream", "slide.MP4"),
    ).toBe("mp4");
  });

  it("builds org-scoped storage paths", () => {
    const path = buildWelcomeSlideStoragePath("org-123", "jpg");
    expect(path.startsWith("org-123/")).toBe(true);
    expect(path.endsWith(".jpg")).toBe(true);
  });
});
