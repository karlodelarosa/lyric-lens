import type { CSSProperties } from "react";
import type { AnnouncementSlide, SlideMode } from "../../contexts/AppContext";

type WelcomeSlideType = "image" | "video";

type LiveSlideContentProps = {
  slideMode: SlideMode;
  welcomeSlideUrl: string | null;
  welcomeSlideType: WelcomeSlideType | null;
  announcementTitle: string | null;
  announcementBody: string | null;
  announcementSlides: AnnouncementSlide[];
  announcementSlideIndex: number;
  cueLabel: string | null;
  cueNotes: string | null;
  lyrics: string | null | undefined;
  textStyle: CSSProperties;
  compact?: boolean;
  scaledFontSize?: number;
};

function renderMediaSlide(
  slide: AnnouncementSlide,
  alt: string,
  className: string,
) {
  if (slide.type === "video") {
    return (
      <video
        key={slide.url}
        src={slide.url}
        autoPlay
        muted
        loop
        playsInline
        className={className}
      />
    );
  }

  return (
    <img key={slide.url} src={slide.url} alt={alt} className={className} />
  );
}

export function LiveSlideContent({
  slideMode,
  welcomeSlideUrl,
  welcomeSlideType,
  announcementTitle,
  announcementBody,
  announcementSlides,
  announcementSlideIndex,
  cueLabel,
  cueNotes,
  lyrics,
  textStyle,
  compact = false,
  scaledFontSize,
}: LiveSlideContentProps) {
  const fontSize =
    scaledFontSize ??
    (typeof textStyle.fontSize === "string"
      ? parseInt(textStyle.fontSize, 10)
      : 48);

  if (slideMode === "blank") {
    return null;
  }

  if (slideMode === "welcome" && welcomeSlideUrl) {
    return renderMediaSlide(
      { url: welcomeSlideUrl, type: welcomeSlideType ?? "image" },
      "Welcome slide",
      "absolute inset-0 z-[1] w-full h-full object-contain",
    );
  }

  if (slideMode === "announcement") {
    const currentSlide = announcementSlides[announcementSlideIndex];
    if (currentSlide) {
      return renderMediaSlide(
        currentSlide,
        `Announcement slide ${announcementSlideIndex + 1}`,
        "absolute inset-0 z-[1] w-full h-full object-contain",
      );
    }

    return (
      <div
        className={`max-w-4xl relative z-[1] ${compact ? "px-6 py-4" : "px-12 py-8"}`}
        style={{
          fontFamily: textStyle.fontFamily,
          textAlign: textStyle.textAlign,
          color: textStyle.color,
        }}
      >
        {announcementTitle && (
          <h2
            className="font-bold mb-4"
            style={{
              fontSize: `${fontSize}px`,
              textShadow: textStyle.textShadow,
            }}
          >
            {announcementTitle}
          </h2>
        )}
        <p
          className="whitespace-pre-wrap"
          style={{
            fontSize: `${Math.max(20, fontSize * 0.65)}px`,
            lineHeight: textStyle.lineHeight,
            textShadow: textStyle.textShadow,
            opacity: 0.9,
          }}
        >
          {announcementBody}
        </p>
      </div>
    );
  }

  if (slideMode === "cue") {
    return (
      <div
        className="max-w-3xl relative z-[1] text-center px-8"
        style={{ color: textStyle.color }}
      >
        <p
          className="font-semibold"
          style={{
            fontSize: `${fontSize}px`,
            textShadow: textStyle.textShadow,
          }}
        >
          {cueLabel}
        </p>
        {cueNotes && (
          <p
            className="mt-4 whitespace-pre-wrap text-lg"
            style={{ opacity: 0.8, textShadow: textStyle.textShadow }}
          >
            {cueNotes}
          </p>
        )}
      </div>
    );
  }

  if (slideMode === "lyrics" && lyrics != null) {
    return (
      <div
        className={`max-w-4xl relative z-[1] ${compact ? "px-6 py-4" : "px-12 py-8"}`}
        style={textStyle}
      >
        {lyrics}
      </div>
    );
  }

  return null;
}
