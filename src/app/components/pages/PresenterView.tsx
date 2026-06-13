import { useCallback, useEffect, useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "../ui/button";
import { LiveSlideContent } from "../live/LiveSlideContent";
import {
  exitFullscreen,
  getFullscreenElement,
  requestElementFullscreen,
  subscribePresenterChannel,
} from "../../lib/presenterWindow";
import { getLiveTextShadow } from "../../lib/liveDisplayUtils";

const getLyricChunks = (lyrics: string, linesPerSlide: number) => {
  const safeLinesPerSlide = Math.max(1, Math.floor(linesPerSlide));
  const lines = lyrics
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return [""];

  const chunks: string[] = [];
  for (let index = 0; index < lines.length; index += safeLinesPerSlide) {
    chunks.push(lines.slice(index, index + safeLinesPerSlide).join("\n"));
  }
  return chunks;
};

export function PresenterView() {
  const { songs, liveState } = useApp();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);

  const currentSong = songs.find((s) => s.id === liveState.currentSongId);
  const currentSection = currentSong?.sections.find(
    (sec) => sec.id === liveState.currentSectionId,
  );
  const currentSectionChunks = currentSection
    ? getLyricChunks(currentSection.lyrics, liveState.linesPerSlide)
    : [];
  const currentChunkIndex = Math.min(
    liveState.currentChunkIndex,
    Math.max(currentSectionChunks.length - 1, 0),
  );
  const sectionLyrics = currentSection
    ? liveState.useLineChunks
      ? currentSectionChunks[currentChunkIndex]
      : currentSection.lyrics
    : undefined;
  const liveLyrics =
    liveState.manualLyrics ?? liveState.displayLyrics ?? sectionLyrics;

  const syncFullscreenState = useCallback(() => {
    setIsFullscreen(Boolean(getFullscreenElement()));
  }, []);

  const handleEnterFullscreen = useCallback(async () => {
    try {
      await requestElementFullscreen(document.documentElement);
      setShowFullscreenPrompt(false);
    } catch {
      setShowFullscreenPrompt(true);
    }
  }, []);

  const handleToggleFullscreen = useCallback(async () => {
    if (getFullscreenElement()) {
      await exitFullscreen();
      return;
    }
    await handleEnterFullscreen();
  }, [handleEnterFullscreen]);

  useEffect(() => {
    const onFullscreenChange = () => {
      syncFullscreenState();
      if (getFullscreenElement()) {
        setShowFullscreenPrompt(false);
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    syncFullscreenState();

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        onFullscreenChange,
      );
    };
  }, [syncFullscreenState]);

  useEffect(() => {
    void handleEnterFullscreen().catch(() => {
      setShowFullscreenPrompt(true);
    });
  }, [handleEnterFullscreen]);

  useEffect(() => {
    return subscribePresenterChannel((message) => {
      if (message.type === "REQUEST_FULLSCREEN") {
        void handleEnterFullscreen().catch(() => setShowFullscreenPrompt(true));
      } else if (message.type === "EXIT_FULLSCREEN") {
        void exitFullscreen();
      }
    });
  }, [handleEnterFullscreen]);

  const textStyle = {
    fontFamily: liveState.fontFamily,
    fontSize: `${liveState.fontSize}px`,
    textAlign: liveState.alignment as "left" | "center" | "right",
    lineHeight: liveState.lineHeight,
    paddingTop:
      liveState.verticalPosition === "top"
        ? `${liveState.topPadding}px`
        : undefined,
    textTransform: liveState.textTransform,
    fontWeight: liveState.fontWeight,
    color: liveState.textColor,
    textShadow: getLiveTextShadow(liveState.textColor),
    whiteSpace: "pre-wrap" as const,
  };

  const announcementSlides = liveState.currentAnnouncementSlides ?? [];

  const hasSlideContent =
    liveState.slideMode === "welcome"
      ? Boolean(liveState.welcomeSlideUrl)
      : liveState.slideMode === "blank"
        ? false
        : liveState.slideMode === "announcement"
          ? announcementSlides.length > 0 ||
            Boolean(liveState.currentAnnouncementBody)
          : liveState.slideMode === "cue"
            ? Boolean(liveState.currentCueLabel)
            : liveState.slideMode === "lyrics" &&
              (liveState.manualLyrics != null ||
                liveState.displayLyrics != null ||
                currentSection);

  const slideContent = hasSlideContent ? (
    <LiveSlideContent
      slideMode={liveState.slideMode}
      welcomeSlideUrl={liveState.welcomeSlideUrl}
      welcomeSlideType={liveState.welcomeSlideType}
      announcementTitle={liveState.currentAnnouncementTitle}
      announcementBody={liveState.currentAnnouncementBody}
      announcementSlides={announcementSlides}
      announcementSlideIndex={liveState.currentChunkIndex}
      cueLabel={liveState.currentCueLabel}
      cueNotes={liveState.currentCueNotes}
      lyrics={
        liveState.slideMode === "lyrics" &&
        (liveState.manualLyrics != null ||
          liveState.displayLyrics != null ||
          currentSection)
          ? (liveLyrics ?? "")
          : undefined
      }
      textStyle={textStyle}
    />
  ) : null;

  const showWaiting = !hasSlideContent && liveState.slideMode !== "blank";

  return (
    <div
      className={`w-screen h-screen flex justify-center overflow-hidden ${
        liveState.verticalPosition === "top"
          ? "items-start"
          : liveState.verticalPosition === "bottom"
            ? "items-end"
            : "items-center"
      }`}
      style={{
        background: liveState.background.value,
      }}
    >
      {liveState.backgroundVideoUrl ? (
        <>
          <video
            key={liveState.backgroundVideoUrl}
            src={liveState.backgroundVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </>
      ) : null}

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-20 bg-black/30 hover:bg-black/50 text-white/70 hover:text-white rounded-full"
        onClick={() => void handleToggleFullscreen()}
        title={isFullscreen ? "Exit fullscreen" : "Fill screen"}
      >
        {isFullscreen ? (
          <Minimize2 className="w-5 h-5" />
        ) : (
          <Maximize2 className="w-5 h-5" />
        )}
      </Button>

      {showFullscreenPrompt && !isFullscreen && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-6">
          <div className="max-w-md rounded-xl border border-white/20 bg-black/80 p-6 text-center text-white shadow-2xl">
            <p className="text-lg font-semibold mb-2">
              Fill screen on this display
            </p>
            <p className="text-sm text-white/70 mb-4">
              Drag this window to your projector or second screen, then enter
              fullscreen here. You can also use Fill screen on the Live page.
            </p>
            <Button
              size="lg"
              className="w-full"
              onClick={() => void handleEnterFullscreen()}
            >
              <Maximize2 className="w-5 h-5 mr-2" />
              Fill screen
            </Button>
          </div>
        </div>
      )}

      {slideContent}

      {showWaiting && (
        <div
          className="text-4xl text-center relative z-[1]"
          style={{ color: liveState.textColor, opacity: 0.3 }}
        >
          <p>Waiting for content...</p>
        </div>
      )}
    </div>
  );
}
