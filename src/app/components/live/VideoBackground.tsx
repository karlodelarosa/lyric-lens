import { useEffect, useRef, useState } from "react";
import { getVideoBackgroundVisualStyle } from "../../lib/sectionIntensity";

// How long before the clip ends we hand off to the standby video. Native
// `loop` causes a visible black flash on restart because the decoder has to
// seek back to the first keyframe and re-buffer. Instead we keep a second
// <video> paused and ready on frame 0, then swap opacity to it before the
// active one finishes, so there's always a decoded frame on screen.
const LOOP_HANDOFF_SECONDS = 0.25;

export function VideoBackground({
  videoUrl,
  intensity = 50,
}: {
  videoUrl: string | null;
  intensity?: number;
}) {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const [activeIsA, setActiveIsA] = useState(true);
  const handedOffRef = useRef(false);

  useEffect(() => {
    handedOffRef.current = false;
    setActiveIsA(true);
    const a = videoARef.current;
    const b = videoBRef.current;
    if (a) {
      a.currentTime = 0;
      a.play().catch(() => {});
    }
    if (b) {
      b.pause();
      b.currentTime = 0;
    }
  }, [videoUrl]);

  useEffect(() => {
    if (!videoUrl) return;
    const active = activeIsA ? videoARef.current : videoBRef.current;
    const standby = activeIsA ? videoBRef.current : videoARef.current;
    if (!active || !standby) return;

    handedOffRef.current = false;
    standby.pause();
    standby.currentTime = 0;

    function handTimeUpdate() {
      if (handedOffRef.current) return;
      const duration = active!.duration;
      if (!duration || !isFinite(duration)) return;
      if (duration - active!.currentTime <= LOOP_HANDOFF_SECONDS) {
        handedOffRef.current = true;
        standby!.currentTime = 0;
        standby!.play().catch(() => {});
        setActiveIsA((prev) => !prev);
      }
    }

    function handEnded() {
      if (handedOffRef.current) return;
      handedOffRef.current = true;
      standby!.currentTime = 0;
      standby!.play().catch(() => {});
      setActiveIsA((prev) => !prev);
    }

    active.addEventListener("timeupdate", handTimeUpdate);
    active.addEventListener("ended", handEnded);
    return () => {
      active.removeEventListener("timeupdate", handTimeUpdate);
      active.removeEventListener("ended", handEnded);
    };
  }, [activeIsA, videoUrl]);

  if (!videoUrl) {
    return null;
  }

  const { filter, scrimOpacity, glowOpacity } =
    getVideoBackgroundVisualStyle(intensity);

  return (
    <>
      <video
        ref={videoARef}
        key={`${videoUrl}-a`}
        src={videoUrl}
        muted
        playsInline
        preload="auto"
        autoPlay={activeIsA}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter,
          opacity: activeIsA ? 1 : 0,
          transition: "filter 700ms ease, opacity 120ms linear",
        }}
      />
      <video
        ref={videoBRef}
        key={`${videoUrl}-b`}
        src={videoUrl}
        muted
        playsInline
        preload="auto"
        autoPlay={!activeIsA}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter,
          opacity: activeIsA ? 0 : 1,
          transition: "filter 700ms ease, opacity 120ms linear",
        }}
      />
      <div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{ opacity: scrimOpacity, transition: "opacity 700ms ease" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: glowOpacity,
          transition: "opacity 700ms ease",
          background:
            "radial-gradient(ellipse at center, rgba(255,208,140,0.9) 0%, rgba(255,208,140,0) 70%)",
          mixBlendMode: "screen",
        }}
      />
    </>
  );
}
