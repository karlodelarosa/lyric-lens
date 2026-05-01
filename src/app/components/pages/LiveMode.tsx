import { useState, useEffect, useRef } from "react";
import { useApp } from "../../contexts/AppContext";
import {
  ChevronRight,
  ChevronLeft,
  Radio,
  Monitor,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Play,
  Rows3,
  Search,
  Video,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "../../lib/utils";

const fontOptions = [
  "Inter",
  "Montserrat",
  "Georgia",
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Verdana",
];

const fontWeightOptions = [
  { label: "Regular (400)", value: "400" },
  { label: "Medium (500)", value: "500" },
  { label: "SemiBold (600)", value: "600" },
  { label: "Bold (700)", value: "700" },
  { label: "ExtraBold (800)", value: "800" },
  { label: "Black (900)", value: "900" },
];

const backgroundPresets = [
  { name: "Purple Gradient", type: "gradient", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Blue Gradient", type: "gradient", value: "linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)" },
  { name: "Sunset", type: "gradient", value: "linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 50%, #2BFF88 100%)" },
  { name: "Ocean", type: "gradient", value: "linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)" },
  { name: "Dark", type: "color", value: "#1a1a1a" },
  { name: "Black", type: "color", value: "#000000" },
];

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

export function LiveMode() {
  const { songs, setlists, liveState, updateLiveState, setCurrentSlide } = useApp();
  const [manualLyricsInput, setManualLyricsInput] = useState("");
  const [selectedSetlistId, setSelectedSetlistId] = useState<string | null>(
    setlists[0]?.id || null
  );
  const [songSearch, setSongSearch] = useState("");
  const [isSlidePreviewMode, setIsSlidePreviewMode] = useState(false);
  const [centerTab, setCenterTab] = useState<"preview" | "manual">("preview");
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState(liveState.backgroundVideoUrl ?? "");
  const [previewScale, setPreviewScale] = useState(1);
  const previewFrameRef = useRef<HTMLDivElement | null>(null);

  const selectedSetlist = setlists.find((sl) => sl.id === selectedSetlistId);
  const setlistSongs = (selectedSetlist?.songs || [])
    .map((songId) => songs.find((s) => s.id === songId))
    .filter((song): song is NonNullable<typeof song> => Boolean(song))
    .filter((song) => {
      const keyword = songSearch.trim().toLowerCase();
      if (!keyword) return true;
      return (
        song.title.toLowerCase().includes(keyword) ||
        song.artist.toLowerCase().includes(keyword) ||
        song.tags.some((tag) => tag.toLowerCase().includes(keyword))
      );
    });
  const currentSong = songs.find((s) => s.id === liveState.currentSongId);
  const currentSection = currentSong?.sections.find(
    (sec) => sec.id === liveState.currentSectionId
  );
  const currentSectionChunks = currentSection
    ? getLyricChunks(currentSection.lyrics, liveState.linesPerSlide)
    : [];
  const currentChunkIndex = Math.min(
    liveState.currentChunkIndex,
    Math.max(currentSectionChunks.length - 1, 0)
  );
  const sectionLyrics = currentSection
    ? liveState.useLineChunks
      ? currentSectionChunks[currentChunkIndex]
      : currentSection.lyrics
    : undefined;
  const liveLyrics = liveState.manualLyrics ?? sectionLyrics;
  const scaledPreviewFontSize = Math.max(14, Math.round(liveState.fontSize * previewScale));
  const currentSongSectionChunks = currentSong
    ? currentSong.sections.map((section) => ({
        section,
        chunks: liveState.useLineChunks
          ? getLyricChunks(section.lyrics, liveState.linesPerSlide)
          : [section.lyrics],
      }))
    : [];

  useEffect(() => {
    if (selectedSetlistId && !liveState.currentSetlistId) {
      updateLiveState({ currentSetlistId: selectedSetlistId });
    }
  }, [selectedSetlistId]);

  useEffect(() => {
    setVideoUrlInput(liveState.backgroundVideoUrl ?? "");
  }, [liveState.backgroundVideoUrl]);

  useEffect(() => {
    const calculateScale = () => {
      if (!previewFrameRef.current) return;
      const width = previewFrameRef.current.clientWidth;
      const nextScale = Math.min(1, Math.max(0.45, width / 1920));
      setPreviewScale(nextScale);
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, []);

  useEffect(() => {
    if (!currentSectionChunks.length) return;
    const maxChunkIndex = currentSectionChunks.length - 1;
    if (liveState.currentChunkIndex > maxChunkIndex) {
      updateLiveState({ currentChunkIndex: maxChunkIndex });
    }
  }, [
    currentSection?.id,
    liveState.linesPerSlide,
    liveState.currentChunkIndex,
    liveState.useLineChunks,
  ]);

  const handleGoLive = () => {
    window.open("/presenter", "_blank", "fullscreen=yes");
    updateLiveState({ isLive: true });
  };

  const handleSectionClick = (songId: string, sectionId: string) => {
    setCurrentSlide(songId, sectionId);
  };

  const handleChunkClick = (songId: string, sectionId: string, chunkIndex: number) => {
    updateLiveState({
      currentSongId: songId,
      currentSectionId: sectionId,
      currentChunkIndex: chunkIndex,
      manualLyrics: null,
    });
  };

  const handleSongClick = (songId: string) => {
    const song = songs.find((s) => s.id === songId);
    const firstSection = song?.sections[0];
    if (!song || !firstSection) return;
    setCurrentSlide(song.id, firstSection.id);
  };

  const getCurrentSectionIndex = () => {
    if (!currentSong || !liveState.currentSectionId) return -1;
    return currentSong.sections.findIndex((s) => s.id === liveState.currentSectionId);
  };

  const handleNext = () => {
    if (!currentSong) return;
    const currentIndex = getCurrentSectionIndex();
    if (
      !liveState.manualLyrics &&
      liveState.useLineChunks &&
      currentSectionChunks.length > 0 &&
      liveState.currentChunkIndex < currentSectionChunks.length - 1
    ) {
      updateLiveState({ currentChunkIndex: liveState.currentChunkIndex + 1 });
      return;
    }

    if (currentIndex < currentSong.sections.length - 1) {
      const nextSection = currentSong.sections[currentIndex + 1];
      setCurrentSlide(currentSong.id, nextSection.id);
    }
  };

  const handlePrevious = () => {
    if (!currentSong) return;
    const currentIndex = getCurrentSectionIndex();
    if (
      !liveState.manualLyrics &&
      liveState.useLineChunks &&
      currentSectionChunks.length > 0 &&
      liveState.currentChunkIndex > 0
    ) {
      updateLiveState({ currentChunkIndex: liveState.currentChunkIndex - 1 });
      return;
    }

    if (currentIndex > 0) {
      const prevSection = currentSong.sections[currentIndex - 1];
      if (liveState.useLineChunks && !liveState.manualLyrics) {
        const prevSectionChunks = getLyricChunks(prevSection.lyrics, liveState.linesPerSlide);
        updateLiveState({
          currentSongId: currentSong.id,
          currentSectionId: prevSection.id,
          manualLyrics: null,
          currentChunkIndex: Math.max(prevSectionChunks.length - 1, 0),
        });
      } else {
        setCurrentSlide(currentSong.id, prevSection.id);
      }
    }
  };

  const canGoPrevious = () => {
    if (!currentSong) return false;
    const currentIndex = getCurrentSectionIndex();
    if (currentIndex < 0) return false;
    if (
      !liveState.manualLyrics &&
      liveState.useLineChunks &&
      currentSectionChunks.length > 0 &&
      liveState.currentChunkIndex > 0
    ) {
      return true;
    }
    return currentIndex > 0;
  };

  const canGoNext = () => {
    if (!currentSong) return false;
    const currentIndex = getCurrentSectionIndex();
    if (currentIndex < 0) return false;
    if (
      !liveState.manualLyrics &&
      liveState.useLineChunks &&
      currentSectionChunks.length > 0 &&
      liveState.currentChunkIndex < currentSectionChunks.length - 1
    ) {
      return true;
    }
    return currentIndex < currentSong.sections.length - 1;
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="border-b bg-card/50 backdrop-blur-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                liveState.isLive ? "bg-red-500 animate-pulse" : "bg-gray-400"
              )} />
              <span className="font-semibold">
                {liveState.isLive ? "LIVE" : "Not Live"}
              </span>
            </div>
            <Select value={selectedSetlistId || ""} onValueChange={setSelectedSetlistId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a setlist" />
              </SelectTrigger>
              <SelectContent>
                {setlists.map((setlist) => (
                  <SelectItem key={setlist.id} value={setlist.id}>
                    {setlist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isCompactMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsCompactMode((prev) => !prev)}
            >
              Compact
            </Button>
            <Button onClick={handleGoLive} size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              <Play className="w-5 h-5 mr-2" />
              Go Live
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Song Navigator */}
        <div className={cn("border-r bg-card/30 backdrop-blur-sm overflow-y-auto", isCompactMode ? "w-64" : "w-80")}>
          <div className="p-4 space-y-2">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
              Song List
            </h2>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search setlist songs..."
                value={songSearch}
                onChange={(e) => setSongSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2">
            {setlistSongs.map((song) => {
              const songId = song.id;

              const isSongActive = liveState.currentSongId === songId;

              return (
                <div key={songId} className="space-y-1">
                  <div className={cn(
                    "p-3 rounded-lg font-medium",
                    isSongActive ? "bg-primary/20 border border-primary" : "bg-card border"
                  )}>
                    {song.title}
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full justify-start mt-1"
                    onClick={() => handleSongClick(songId)}
                  >
                    Start song from first slide
                  </Button>

                  <div className="ml-4 space-y-1">
                    {song.sections.map((section) => {
                      const isActive = isSongActive && section.id === liveState.currentSectionId;
                      const firstLine = section.lyrics.split("\n")[0];

                      return (
                        <button
                          key={section.id}
                          onClick={() => handleSectionClick(songId, section.id)}
                          className={cn(
                            "w-full text-left p-2 rounded text-sm transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "hover:bg-accent"
                          )}
                        >
                          <div className="text-xs opacity-80">
                            {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
                            {section.number ? ` ${section.number}` : ""}
                          </div>
                          <div className="truncate">{firstLine}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>

        {/* Center Panel - Live Control */}
        <div className="flex-1 flex flex-col">
          {/* Preview/Manual Tabs */}
          <div className={cn("flex-1 min-h-0", isCompactMode ? "p-3" : "p-6")}>
            <Tabs
              value={centerTab}
              onValueChange={(value) => setCenterTab(value as "preview" | "manual")}
              className="h-full"
            >
              <div className="mb-3 flex justify-end">
                <TabsList>
                  <TabsTrigger value="preview">Live Preview</TabsTrigger>
                  <TabsTrigger value="manual">Manual Override</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="preview" className="h-[calc(100%-44px)]">
                <Card className="h-full min-h-0">
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Monitor className="w-5 h-5" />
                        Live Preview
                      </CardTitle>
                      {liveState.isLive && (
                        <Badge variant="destructive" className="animate-pulse">
                          <Radio className="w-3 h-3 mr-1" />
                          Broadcasting
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className={cn("h-[calc(100%-80px)] overflow-y-auto", isCompactMode ? "p-3" : "p-6")}>
                    {isSlidePreviewMode ? (
                      <div className="space-y-4 max-h-full overflow-y-auto pr-1 mx-auto w-full max-w-[1800px]">
                        {!currentSong ? (
                          <div className="text-muted-foreground text-sm">
                            Select a song to see clickable slides.
                          </div>
                        ) : (
                          currentSongSectionChunks.map(({ section, chunks }) => {
                            const isSectionActive = liveState.currentSectionId === section.id;
                            return (
                              <div key={section.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <button
                                    onClick={() => handleSectionClick(currentSong.id, section.id)}
                                    className={cn(
                                      "text-sm font-semibold transition-colors",
                                      isSectionActive ? "text-primary" : "text-foreground/80 hover:text-foreground"
                                    )}
                                  >
                                    {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
                                    {section.number ? ` ${section.number}` : ""}
                                  </button>
                                  <span className="text-xs text-muted-foreground">
                                    {chunks.length} slide{chunks.length > 1 ? "s" : ""}
                                  </span>
                                </div>
                                <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
                                  {chunks.map((chunk, chunkIndex) => {
                                    const isActiveSlide =
                                      isSectionActive && currentChunkIndex === chunkIndex;
                                    return (
                                      <button
                                        key={`${section.id}-${chunkIndex}`}
                                        onClick={() =>
                                          handleChunkClick(currentSong.id, section.id, chunkIndex)
                                        }
                                        className={cn(
                                          "relative aspect-video overflow-hidden rounded-md border text-left",
                                          isActiveSlide
                                            ? "border-primary ring-2 ring-primary/50"
                                            : "border-border hover:border-primary/40"
                                        )}
                                        style={{ background: liveState.background.value }}
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
                                            <div className="absolute inset-0 bg-black/40" />
                                          </>
                                        ) : null}
                                        <div
                                          className={cn(
                                            "relative z-[1] h-full p-3 flex",
                                            liveState.verticalPosition === "top" && "items-start",
                                            liveState.verticalPosition === "center" && "items-center",
                                            liveState.verticalPosition === "bottom" && "items-end",
                                          )}
                                        >
                                          <div
                                            className="w-full"
                                            style={{
                                              fontFamily: liveState.fontFamily,
                                              fontSize: `${Math.max(10, Math.round(scaledPreviewFontSize * 0.36))}px`,
                                              textAlign: liveState.alignment,
                                              lineHeight: liveState.lineHeight,
                                              textTransform: liveState.textTransform,
                                              fontWeight: liveState.fontWeight,
                                              color: "white",
                                              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                                              whiteSpace: "pre-wrap",
                                            }}
                                          >
                                            {chunk}
                                          </div>
                                        </div>
                                        <span className="absolute top-2 right-2 z-[2] rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                                          {chunkIndex + 1}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    ) : (
                      <div
                        ref={previewFrameRef}
                        className={cn(
                          "relative w-full mx-auto rounded-lg overflow-hidden shadow-2xl flex justify-center aspect-video",
                          isCompactMode ? "max-h-[34vh]" : "max-h-[42vh]",
                          liveState.verticalPosition === "top" && "items-start",
                          liveState.verticalPosition === "center" && "items-center",
                          liveState.verticalPosition === "bottom" && "items-end",
                        )}
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

                        {liveLyrics ? (
                          <div
                            className={cn("max-w-4xl relative z-[1]", isCompactMode ? "px-6 py-4" : "px-12 py-8")}
                            style={{
                              fontFamily: liveState.fontFamily,
                              fontSize: `${scaledPreviewFontSize}px`,
                              textAlign: liveState.alignment,
                              lineHeight: liveState.lineHeight,
                              textTransform: liveState.textTransform,
                              fontWeight: liveState.fontWeight,
                              color: "white",
                              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {liveLyrics}
                          </div>
                        ) : (
                          <div className="text-white/50 text-center">
                            <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-xl">Select a song to begin</p>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {isSlidePreviewMode
                        ? "Click any slide thumbnail to push it live."
                        : `Preview scale ${Math.round(previewScale * 100)}% (live output still uses ${liveState.fontSize}px)`}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manual" className="h-[calc(100%-44px)]">
                <Card className="h-full min-h-0">
                  <CardHeader className="border-b">
                    <CardTitle>Manual Live Lyrics Override</CardTitle>
                  </CardHeader>
                  <CardContent className={cn("h-[calc(100%-80px)] space-y-3", isCompactMode ? "p-3" : "p-6")}>
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Manual Live Lyrics Override</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateLiveState({ manualLyrics: null })}
                      >
                        Use selected section
                      </Button>
                    </div>
                    <Textarea
                      value={manualLyricsInput}
                      onChange={(e) => setManualLyricsInput(e.target.value)}
                      placeholder="Type or paste lyrics you want to push live..."
                      className="min-h-40"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={() =>
                          updateLiveState({
                            manualLyrics: manualLyricsInput.trim() || null,
                          })
                        }
                      >
                        Push manual lyrics live
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Control Bar */}
          <div className={cn("border-t bg-card/50 backdrop-blur-sm", isCompactMode ? "p-2" : "p-4")}>
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex-1">
                {currentSong && (
                  <div>
                    <p className="font-semibold">{currentSong.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {currentSection?.type.charAt(0).toUpperCase()}
                      {currentSection?.type.slice(1)}
                      {currentSection?.number ? ` ${currentSection.number}` : ''}
                    </p>
                    {!liveState.manualLyrics &&
                      liveState.useLineChunks &&
                      currentSectionChunks.length > 1 && (
                        <p className="text-xs text-muted-foreground">
                          Slide {currentChunkIndex + 1} / {currentSectionChunks.length}
                        </p>
                      )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePrevious}
                  disabled={!canGoPrevious()}
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleNext}
                  disabled={!canGoNext()}
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              <div className="flex-1" />
            </div>
          </div>

        </div>

        {/* Right Panel - Settings */}
        <div className={cn("border-l bg-card/30 backdrop-blur-sm overflow-y-auto p-4 space-y-6", isCompactMode ? "hidden" : "w-80")}>
          <div>
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
              Live Settings
            </h2>
          </div>

          {/* Font Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <Label>Typography</Label>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Font Family</Label>
                <Select
                  value={liveState.fontFamily}
                  onValueChange={(value) => updateLiveState({ fontFamily: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font} value={font}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Font Size: {liveState.fontSize}px</Label>
                <Slider
                  value={[liveState.fontSize]}
                  onValueChange={([value]) => updateLiveState({ fontSize: value })}
                  min={24}
                  max={96}
                  step={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Line Height: {liveState.lineHeight}</Label>
                <Slider
                  value={[liveState.lineHeight]}
                  onValueChange={([value]) => updateLiveState({ lineHeight: value })}
                  min={1}
                  max={2.5}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Text Transform</Label>
                <Select
                  value={liveState.textTransform}
                  onValueChange={(value: any) => updateLiveState({ textTransform: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Normal</SelectItem>
                    <SelectItem value="uppercase">UPPERCASE</SelectItem>
                    <SelectItem value="lowercase">lowercase</SelectItem>
                    <SelectItem value="capitalize">Capitalize</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant={liveState.textTransform === "uppercase" ? "default" : "outline"}
                onClick={() =>
                  updateLiveState({
                    textTransform:
                      liveState.textTransform === "uppercase" ? "none" : "uppercase",
                  })
                }
              >
                Toggle ALL CAPS
              </Button>

              <div className="space-y-2">
                <Label className="text-xs">Font Weight</Label>
                <Select
                  value={String(liveState.fontWeight)}
                  onValueChange={(value) =>
                    updateLiveState({
                      fontWeight: Number(value) as 400 | 500 | 600 | 700 | 800 | 900,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontWeightOptions.map((weight) => (
                      <SelectItem key={weight.value} value={weight.value}>
                        {weight.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Alignment */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlignCenter className="w-4 h-4" />
              <Label>Alignment</Label>
            </div>
            <div className="flex gap-2">
              <Button
                variant={liveState.alignment === "left" ? "default" : "outline"}
                size="icon"
                onClick={() => updateLiveState({ alignment: "left" })}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                variant={liveState.alignment === "center" ? "default" : "outline"}
                size="icon"
                onClick={() => updateLiveState({ alignment: "center" })}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                variant={liveState.alignment === "right" ? "default" : "outline"}
                size="icon"
                onClick={() => updateLiveState({ alignment: "right" })}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Vertical Position</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={liveState.verticalPosition === "top" ? "default" : "outline"}
                  onClick={() => updateLiveState({ verticalPosition: "top" })}
                >
                  Top
                </Button>
                <Button
                  variant={liveState.verticalPosition === "center" ? "default" : "outline"}
                  onClick={() => updateLiveState({ verticalPosition: "center" })}
                >
                  Center
                </Button>
                <Button
                  variant={liveState.verticalPosition === "bottom" ? "default" : "outline"}
                  onClick={() => updateLiveState({ verticalPosition: "bottom" })}
                >
                  Bottom
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rows3 className="w-4 h-4 text-primary" />
                <Label className="text-base font-semibold text-primary">Slide Options</Label>
              </div>
              <Badge variant="secondary">Important</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure how lyrics are split and previewed before going live.
            </p>
            <div className="flex items-center justify-between rounded-md border bg-background/80 p-3">
              <div className="space-y-0.5">
                <Label className="text-sm">Slide preview mode</Label>
                <p className="text-xs text-muted-foreground">
                  Show generated slides as clickable thumbnails.
                </p>
              </div>
              <Switch
                checked={isSlidePreviewMode}
                onCheckedChange={setIsSlidePreviewMode}
                aria-label="Toggle slide preview mode"
              />
            </div>
            <div className="flex items-center justify-between rounded-md border bg-background/80 p-3">
              <div className="space-y-0.5">
                <Label className="text-sm">Line chunks</Label>
                <p className="text-xs text-muted-foreground">
                  Split each section into smaller slides.
                </p>
              </div>
              <Switch
                checked={liveState.useLineChunks}
                onCheckedChange={(checked) =>
                  updateLiveState({
                    useLineChunks: checked,
                    currentChunkIndex: 0,
                  })
                }
                aria-label="Toggle line chunks"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">
                Lines per chunk: {liveState.linesPerSlide}
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={liveState.linesPerSlide === value ? "default" : "outline"}
                    onClick={() =>
                      updateLiveState({
                        linesPerSlide: value,
                        currentChunkIndex: 0,
                      })
                    }
                  >
                    {value}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Choose between 1 and 4 lines per chunk.
              </p>
            </div>
          </div>

          {/* Background */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <Label>Background</Label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {backgroundPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() =>
                    updateLiveState({
                      background: { type: preset.type as any, value: preset.value },
                    })
                  }
                  className={cn(
                    "h-16 rounded-lg border-2 transition-all",
                    liveState.background.value === preset.value
                      ? "border-primary ring-2 ring-primary/50"
                      : "border-border hover:border-primary/50"
                  )}
                  style={{ background: preset.value }}
                >
                  <span className="sr-only">{preset.name}</span>
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Custom Color</Label>
              <Input
                type="color"
                value={
                  liveState.background.type === "color" ? liveState.background.value : "#000000"
                }
                onChange={(e) =>
                  updateLiveState({
                    background: { type: "color", value: e.target.value },
                  })
                }
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                <Label className="text-xs">Background Video URL</Label>
              </div>
              <Input
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                placeholder="https://your-cdn.com/background.mp4"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    updateLiveState({
                      backgroundVideoUrl: videoUrlInput.trim() || null,
                    })
                  }
                >
                  Apply video background
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setVideoUrlInput("");
                    updateLiveState({ backgroundVideoUrl: null });
                  }}
                >
                  Clear
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended: use a short looping MP4 hosted on a fast CDN for smoother playback.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
