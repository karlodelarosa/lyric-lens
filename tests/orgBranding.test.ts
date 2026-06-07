import { describe, expect, it } from "vitest";
import {
  buildOrgLogoStoragePath,
  getOrgLogoExtension,
  isAllowedOrgLogoFile,
} from "../backend/domain/organization/orgLogoUpload";
import {
  isOrgThemePresetId,
  resolveOrgThemePresetId,
} from "../backend/domain/organization/orgThemePresets";

describe("orgLogoUpload", () => {
  it("accepts common image types", () => {
    expect(isAllowedOrgLogoFile({ type: "image/png", name: "logo.png" })).toBe(
      true,
    );
    expect(isAllowedOrgLogoFile({ type: "", name: "logo.svg" })).toBe(true);
  });

  it("rejects non-image files", () => {
    expect(isAllowedOrgLogoFile({ type: "video/mp4", name: "clip.mp4" })).toBe(
      false,
    );
  });

  it("builds a stable logo storage path", () => {
    expect(buildOrgLogoStoragePath("org-1", "png")).toBe("org-1/logo.png");
  });

  it("resolves extensions from mime or filename", () => {
    expect(getOrgLogoExtension("image/svg+xml")).toBe("svg");
    expect(getOrgLogoExtension("", "church-logo.webp")).toBe("webp");
  });
});

describe("orgThemePresets", () => {
  it("validates preset ids", () => {
    expect(isOrgThemePresetId("blue")).toBe(true);
    expect(isOrgThemePresetId("invalid")).toBe(false);
  });

  it("falls back to purple", () => {
    expect(resolveOrgThemePresetId(undefined)).toBe("purple");
    expect(resolveOrgThemePresetId("unknown")).toBe("purple");
  });
});
