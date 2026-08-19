import { cn } from "../../lib/utils";
import { getLiveTextShadow } from "../../lib/liveDisplayUtils";
import { getVideoBackgroundVisualStyle } from "../../lib/sectionIntensity";

type LyricSlideThumbnailProps = {
  chunkText: string;
  chunkIndex: number;
  isActive: boolean;
  onClick: () => void;
  backgroundValue: string;
  hasBackgroundVideo: boolean;
  sectionIntensity: number;
  verticalPosition: "top" | "center" | "bottom";
  fontFamily: string;
  fontSize: number;
  alignment: "left" | "center" | "right";
  lineHeight: number;
  topPadding: number;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  fontWeight: 400 | 500 | 600 | 700 | 800 | 900;
  textColor: string;
  className?: string;
};

export function LyricSlideThumbnail({
  chunkText,
  chunkIndex,
  isActive,
  onClick,
  backgroundValue,
  hasBackgroundVideo,
  sectionIntensity,
  verticalPosition,
  fontFamily,
  fontSize,
  alignment,
  lineHeight,
  topPadding,
  textTransform,
  fontWeight,
  textColor,
  className,
}: LyricSlideThumbnailProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative aspect-video overflow-hidden rounded-md border text-left shrink-0 transition-shadow",
        isActive
          ? "border-primary shadow-[var(--shadow-glow)]"
          : "border-border hover:border-primary/40",
        className,
      )}
      style={{ background: backgroundValue }}
    >
      {hasBackgroundVideo ? (
        <div
          className="absolute inset-0 pointer-events-none bg-black"
          style={{
            opacity: getVideoBackgroundVisualStyle(sectionIntensity)
              .scrimOpacity,
          }}
        />
      ) : null}
      <div
        className={cn(
          "relative z-[1] h-full p-3 flex",
          verticalPosition === "top" && "items-start",
          verticalPosition === "center" && "items-center",
          verticalPosition === "bottom" && "items-end",
        )}
      >
        <div
          className="w-full"
          style={{
            fontFamily,
            fontSize: `${fontSize}px`,
            textAlign: alignment,
            lineHeight,
            paddingTop: verticalPosition === "top" ? `${topPadding}px` : undefined,
            textTransform,
            fontWeight,
            color: textColor,
            textShadow: getLiveTextShadow(textColor),
            whiteSpace: "pre-wrap",
          }}
        >
          {chunkText}
        </div>
      </div>
      <span className="absolute top-2 right-2 z-[2] rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
        {chunkIndex + 1}
      </span>
    </button>
  );
}
