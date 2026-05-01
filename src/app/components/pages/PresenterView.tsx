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
    // Request fullscreen on mount
    const requestFullscreen = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    };

    // Small delay to ensure the window is ready
    setTimeout(requestFullscreen, 100);
  }, []);

  const handleFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      void elem.requestFullscreen();
    }
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

      {liveLyrics ? (
        <div className="w-full px-16 py-12 max-w-7xl relative z-[1]">
          <div
            className="w-full"
            style={{
              fontFamily: liveState.fontFamily,
              fontSize: `${liveState.fontSize}px`,
              textAlign: liveState.alignment,
              lineHeight: liveState.lineHeight,
              paddingTop:
                liveState.verticalPosition === "top"
                  ? `${liveState.topPadding}px`
                  : undefined,
              textTransform: liveState.textTransform,
              fontWeight: liveState.fontWeight,
              color: "white",
              textShadow: "0 4px 12px rgba(0,0,0,0.8)",
              whiteSpace: "pre-wrap",
            }}
          >
            {liveLyrics}
          </div>
        </div>
      ) : (
        <div className="text-white/30 text-4xl text-center">
          <p>Waiting for content...</p>
        </div>
      )}
    </div>
  );
}
