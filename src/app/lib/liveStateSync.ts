export const LIVE_STATE_STORAGE_KEY = "lyric-lens-live-state";
export const LIVE_STATE_CHANNEL_NAME = "lyric-lens-live-state";

export function readLiveStateFromStorage(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;

  const saved = window.localStorage.getItem(LIVE_STATE_STORAGE_KEY);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function writeLiveStateToStorage(state: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LIVE_STATE_STORAGE_KEY, JSON.stringify(state));
}

export function createLiveStateChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }

  return new BroadcastChannel(LIVE_STATE_CHANNEL_NAME);
}

export function publishLiveState(
  channel: BroadcastChannel | null,
  state: Record<string, unknown>,
) {
  writeLiveStateToStorage(state);
  channel?.postMessage(state);
}

export function buildLiveUrl(setlistId?: string | null) {
  if (!setlistId) return "/live";
  return `/live?setlistId=${encodeURIComponent(setlistId)}`;
}
