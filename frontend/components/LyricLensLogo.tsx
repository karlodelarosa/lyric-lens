import * as React from "react";
import { cn } from "../../src/app/components/ui/utils";

/**
 * Lyric Lens brand mark: an aperture-style lens ring wrapped around an
 * equalizer glyph — "seeing" the lyric/song through the lens.
 * Renders with a violet gradient by default; pass `mono` to draw it in
 * the current text color (useful on colored backgrounds).
 */
export function LyricLensMark({
  className,
  mono = false,
  ...props
}: React.ComponentProps<"svg"> & { mono?: boolean }) {
  const gradId = React.useId();
  const stroke = mono ? "currentColor" : `url(#${gradId})`;

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Lyric Lens"
      className={cn(className)}
      {...props}
    >
      {!mono && (
        <defs>
          <linearGradient id={gradId} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#c3aeff" />
            <stop offset="1" stopColor="#6d4fe0" />
          </linearGradient>
        </defs>
      )}

      {/* Lens ring */}
      <circle cx="24" cy="24" r="18" stroke={stroke} strokeWidth="3" />
      {/* Aperture highlight */}
      <path
        d="M24 8a16 16 0 0 1 11.3 4.7"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.35"
      />

      {/* Equalizer glyph = the "lyric" */}
      <g stroke={stroke} strokeWidth="3" strokeLinecap="round">
        <line x1="18" y1="21" x2="18" y2="27" />
        <line x1="24" y1="16" x2="24" y2="32" />
        <line x1="30" y1="19" x2="30" y2="29" />
      </g>
    </svg>
  );
}

/** Full lockup: mark + "Lyric Lens" wordmark. */
export function LyricLensLogo({
  className,
  mono = false,
  subtitle = "Worship Platform",
}: {
  className?: string;
  mono?: boolean;
  subtitle?: string | null;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LyricLensMark mono={mono} className="w-9 h-9 shrink-0" />
      <div className="leading-tight">
        <p
          className={cn(
            "font-display font-semibold tracking-tight",
            mono ? "text-current" : "text-foreground",
          )}
        >
          Lyric Lens
        </p>
        {subtitle && (
          <p
            className={cn(
              "text-xs mt-0.5",
              mono ? "text-current/70" : "text-muted-foreground",
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
