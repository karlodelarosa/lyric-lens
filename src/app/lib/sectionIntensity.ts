import type { SongSectionType } from "../contexts/AppContext";

/**
 * Default background-video intensity (0-100) per section type, used when a
 * section has no explicit override. Mirrors the natural dynamic arc of a
 * worship song: quiet intro/verse, building pre-chorus, bright chorus,
 * peak bridge/tag.
 */
export const DEFAULT_SECTION_INTENSITY: Record<SongSectionType, number> = {
  intro: 25,
  verse: 35,
  pre_chorus: 55,
  chorus: 80,
  bridge: 100,
  tag: 70,
  outro: 20,
  custom: 50,
};

/**
 * Resolves which video plays behind the live lyrics: a section's own
 * background wins, then the song's default, then the live "fallback" URL an
 * operator can set for the current service. If none apply, callers should
 * fall back to a solid black background rather than showing nothing.
 */
export function resolveBackgroundVideoUrl(params: {
  isLyricsMode: boolean;
  sectionBackgroundVideoUrl?: string | null;
  songBackgroundVideoUrl?: string | null;
  liveOverrideUrl?: string | null;
  forceSolidBackground?: boolean;
}): string | null {
  const {
    isLyricsMode,
    sectionBackgroundVideoUrl,
    songBackgroundVideoUrl,
    liveOverrideUrl,
    forceSolidBackground,
  } = params;

  if (forceSolidBackground) return null;

  return (
    (isLyricsMode && sectionBackgroundVideoUrl) ||
    (isLyricsMode && songBackgroundVideoUrl) ||
    liveOverrideUrl ||
    null
  );
}

export function getSectionIntensity(section: {
  type: SongSectionType;
  intensity?: number | null;
}): number {
  if (typeof section.intensity === "number") {
    return Math.min(100, Math.max(0, section.intensity));
  }
  return DEFAULT_SECTION_INTENSITY[section.type] ?? 50;
}

export type VideoBackgroundVisualStyle = {
  filter: string;
  scrimOpacity: number;
  glowOpacity: number;
};

/**
 * Maps a 0-100 intensity to the CSS knobs the live video background uses to
 * "shine" brighter for bigger moments: brighter/more saturated video, a
 * thinner dark scrim, and a warm bloom layer that fades in at the peak.
 */
export function getVideoBackgroundVisualStyle(
  intensity: number,
): VideoBackgroundVisualStyle {
  const t = Math.min(100, Math.max(0, intensity)) / 100;
  const brightness = 0.55 + t * 0.6;
  const saturate = 0.8 + t * 0.5;
  const scrimOpacity = 0.55 - t * 0.4;
  const glowOpacity = t * 0.5;

  return {
    filter: `brightness(${brightness.toFixed(2)}) saturate(${saturate.toFixed(2)})`,
    scrimOpacity,
    glowOpacity,
  };
}
