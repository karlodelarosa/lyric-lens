export const PRESENTER_WINDOW_NAME = "lyric-lens-presenter";
export const PRESENTER_CHANNEL_NAME = "lyric-lens-presenter";

export type PresenterChannelMessage =
  | { type: "REQUEST_FULLSCREEN" }
  | { type: "EXIT_FULLSCREEN" };

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
  webkitRequestFullScreen?: () => Promise<void>;
};

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void>;
  webkitFullscreenElement?: Element | null;
};

export function getFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

export async function requestElementFullscreen(
  element: HTMLElement,
): Promise<void> {
  const target = element as FullscreenElement;
  const request =
    target.requestFullscreen?.bind(target) ??
    target.webkitRequestFullscreen?.bind(target) ??
    target.webkitRequestFullScreen?.bind(target);

  if (!request) {
    throw new Error("Fullscreen is not supported in this browser");
  }

  await request();
}

export async function exitFullscreen(): Promise<void> {
  const doc = document as FullscreenDocument;
  const exit =
    document.exitFullscreen?.bind(document) ??
    doc.webkitExitFullscreen?.bind(document);

  if (!exit) return;
  await exit();
}

export function openPresenterWindow(path = "/presenter"): Window | null {
  if (typeof window === "undefined") return null;

  return window.open(
    path,
    PRESENTER_WINDOW_NAME,
    "popup=yes,width=1920,height=1080",
  );
}

/** Request fullscreen on the presenter popup (must run during a user click). */
export function requestPresenterFullscreen(
  presenterWindow: Window | null,
): boolean {
  if (!presenterWindow || presenterWindow.closed) return false;

  try {
    presenterWindow.focus();
    const root = presenterWindow.document?.documentElement;
    if (!root) return false;
    void requestElementFullscreen(root);
    return true;
  } catch {
    return false;
  }
}

export function broadcastPresenterMessage(message: PresenterChannelMessage) {
  if (typeof BroadcastChannel === "undefined") return;

  const channel = new BroadcastChannel(PRESENTER_CHANNEL_NAME);
  channel.postMessage(message);
  channel.close();
}

export function subscribePresenterChannel(
  handler: (message: PresenterChannelMessage) => void,
): () => void {
  if (typeof BroadcastChannel === "undefined") {
    return () => undefined;
  }

  const channel = new BroadcastChannel(PRESENTER_CHANNEL_NAME);
  const onMessage = (event: MessageEvent) => {
    const data = event.data as PresenterChannelMessage;
    if (
      data?.type === "REQUEST_FULLSCREEN" ||
      data?.type === "EXIT_FULLSCREEN"
    ) {
      handler(data);
    }
  };

  channel.addEventListener("message", onMessage);
  return () => channel.close();
}
