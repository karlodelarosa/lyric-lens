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
  if (
    typeof window === "undefined" ||
    typeof BroadcastChannel === "undefined"
  ) {
    return null;
  }

  return new BroadcastChannel(LIVE_STATE_CHANNEL_NAME);
}

export type LiveStateBroadcast = {
  sourceId: string;
  state: Record<string, unknown>;
};

export function isLiveStateBroadcast(
  data: unknown,
): data is LiveStateBroadcast {
  return (
    typeof data === "object" &&
    data !== null &&
    "sourceId" in data &&
    "state" in data &&
    typeof (data as LiveStateBroadcast).sourceId === "string" &&
    typeof (data as LiveStateBroadcast).state === "object" &&
    (data as LiveStateBroadcast).state !== null
  );
}

export function publishLiveState(
  channel: BroadcastChannel | null,
  sourceId: string,
  state: Record<string, unknown>,
) {
  writeLiveStateToStorage(state);
  channel?.postMessage({ sourceId, state } satisfies LiveStateBroadcast);
}

export type BuildLiveUrlOptions = {
  setlistId?: string | null;
  serviceFlowId?: string | null;
};

export function buildLiveUrl(options?: string | null | BuildLiveUrlOptions) {
  if (
    typeof options === "string" ||
    options === null ||
    options === undefined
  ) {
    if (!options) return "/live";
    return `/live?setlistId=${encodeURIComponent(options)}`;
  }

  const params = new URLSearchParams();
  if (options.serviceFlowId) {
    params.set("serviceFlowId", options.serviceFlowId);
  } else if (options.setlistId) {
    params.set("setlistId", options.setlistId);
  }

  const query = params.toString();
  return query ? `/live?${query}` : "/live";
}
