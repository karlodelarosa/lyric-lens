import { useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import { Maximize2 } from "lucide-react";
import { Button } from "../ui/button";

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
  const liveLyrics = liveState.manualLyrics ?? sectionLyrics;

  useEffect(() => {
    const requestFullscreen = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    };

    setTimeout(requestFullscreen, 100);
  }, []);

  const handleFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      void elem.requestFullscreen();
    }
  };

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
    color: "white",
    textShadow: "0 4px 12px rgba(0,0,0,0.8)",
    whiteSpace: "pre-wrap" as const,
  };

  const renderContent = () => {
    if (liveState.slideMode === "announcement") {
      return (
        <div className="w-full px-16 py-12 max-w-7xl relative z-[1] text-white">
          {liveState.currentAnnouncementTitle && (
            <h2 className="font-bold mb-6" style={textStyle}>
              {liveState.currentAnnouncementTitle}
            </h2>
          )}
          <p
            style={{
              ...textStyle,
              fontSize: `${Math.max(28, liveState.fontSize * 0.7)}px`,
            }}
          >
            {liveState.currentAnnouncementBody}
          </p>
        </div>
      );
    }

    if (liveState.slideMode === "cue") {
      return (
        <div className="w-full px-16 py-12 max-w-5xl relative z-[1] text-center text-white">
          <p style={textStyle}>{liveState.currentCueLabel}</p>
          {liveState.currentCueNotes && (
            <p
              className="mt-6 text-white/85"
              style={{
                ...textStyle,
                fontSize: `${Math.max(24, liveState.fontSize * 0.55)}px`,
              }}
            >
              {liveState.currentCueNotes}
            </p>
          )}
        </div>
      );
    }

    if (
      liveState.slideMode === "lyrics" &&
      (liveState.manualLyrics != null || currentSection)
    ) {
      return (
        <div className="w-full px-16 py-12 max-w-7xl relative z-[1]">
          <div className="w-full" style={textStyle}>
            {liveLyrics ?? ""}
          </div>
        </div>
      );
    }

    return (
      <div className="text-white/30 text-4xl text-center">
        <p>Waiting for content...</p>
      </div>
    );
  };

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
        className="absolute top-4 right-4 z-10 bg-black/30 hover:bg-black/50 text-white/70 hover:text-white rounded-full"
        onClick={handleFullscreen}
      >
        <Maximize2 className="w-5 h-5" />
      </Button>

      {renderContent()}
    </div>
  );
}
