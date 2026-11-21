import { useCallback, useEffect, useRef, useState } from "react";
import { getVideoBackgroundVisualStyle } from "../../lib/sectionIntensity";

const SOURCE_CROSSFADE_MS = 700;
const LOOP_CROSSFADE_MS = 1000;
const LOOP_HANDOFF_SECONDS = LOOP_CROSSFADE_MS / 1000;

type Transition = {
  from: number | null;
  to: number | null;
  duration: number;
};

type PendingPlayback = {
  index: number;
  url: string;
  kind: "source" | "loop";
  token: number;
};

export function VideoBackground({
  videoUrl,
  intensity = 50,
}: {
  videoUrl: string | null;
  intensity?: number;
}) {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const videos = [videoARef, videoBRef] as const;
  const [activeIndex, setActiveIndex] = useState(0);
  const [sources, setSources] = useState<[string | null, string | null]>([
    videoUrl,
    null,
  ]);
  const [ready, setReady] = useState<[boolean, boolean]>([false, false]);
  const [transition, setTransition] = useState<Transition | null>(null);
  const pendingRef = useRef<PendingPlayback | null>(null);
  const nextTokenRef = useRef(0);
  const latestUrlRef = useRef(videoUrl);

  latestUrlRef.current = videoUrl;

  const beginTransition = useCallback(
    (from: number | null, to: number | null, duration: number) => {
      setTransition({ from, to, duration });
    },
    [],
  );

  const startPendingPlayback = useCallback((pending: PendingPlayback) => {
    const current = pendingRef.current;
    const video = videos[pending.index].current;
    if (
      !video ||
      !current ||
      current.token !== pending.token ||
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      return;
    }

    video.play().catch(() => {
      if (pendingRef.current?.token === pending.token) {
        pendingRef.current = null;
        if (pending.kind === "loop") {
          videos[activeIndex].current?.play().catch(() => {});
        }
      }
    });
  }, [activeIndex]);

  const handleLoadedData = (index: number) => {
    setReady((previous) => {
      const next = [...previous] as [boolean, boolean];
      next[index] = true;
      return next;
    });

    const pending = pendingRef.current;
    const video = videos[index].current;
    if (!video) return;

    if (pending?.index === index && video.getAttribute("src") === pending.url) {
      startPendingPlayback(pending);
      return;
    }

    const standbyIndex = 1 - activeIndex;
    if (
      index === standbyIndex &&
      sources[index] === sources[activeIndex] &&
      !transition
    ) {
      video.pause();
      if (video.currentTime !== 0) video.currentTime = 0;
    }
  };

  const handlePlaying = (index: number) => {
    const pending = pendingRef.current;
    if (!pending || pending.index !== index) return;
    if (videos[index].current?.getAttribute("src") !== pending.url) return;
    if (latestUrlRef.current !== pending.url) return;

    const from = activeIndex;
    pendingRef.current = null;
    beginTransition(
      sources[from] ? from : null,
      index,
      pending.kind === "loop" ? LOOP_CROSSFADE_MS : SOURCE_CROSSFADE_MS,
    );
  };

  const handleError = (index: number) => {
    const pending = pendingRef.current;
    if (pending?.index === index) {
      pendingRef.current = null;
      if (pending.kind === "loop") {
        videos[activeIndex].current?.play().catch(() => {});
      }
    }
  };

  useEffect(() => {
    if (!transition) return;

    const timeout = window.setTimeout(() => {
      if (transition.to == null) {
        if (transition.from != null) {
          videos[transition.from].current?.pause();
          setSources((previous) => {
            const next = [...previous] as [string | null, string | null];
            next[transition.from!] = null;
            return next;
          });
          setReady((previous) => {
            const next = [...previous] as [boolean, boolean];
            next[transition.from!] = false;
            return next;
          });
        }
      } else {
        setActiveIndex(transition.to);
        if (transition.from != null) {
          const oldVideo = videos[transition.from].current;
          oldVideo?.pause();
          if (oldVideo && oldVideo.currentTime !== 0) oldVideo.currentTime = 0;

          if (transition.from !== transition.to) {
            setSources((previous) => {
              const next = [...previous] as [string | null, string | null];
              next[transition.from!] = previous[transition.to!];
              return next;
            });
            setReady((previous) => {
              const next = [...previous] as [boolean, boolean];
              next[transition.from!] = false;
              return next;
            });
          }
        }
      }
      setTransition(null);
    }, transition.duration);

    return () => window.clearTimeout(timeout);
  }, [transition]);

  useEffect(() => {
    if (transition) return;

    if (!videoUrl) {
      if (sources[activeIndex]) {
        beginTransition(activeIndex, null, SOURCE_CROSSFADE_MS);
      }
      return;
    }

    if (sources[activeIndex] === videoUrl) {
      if (pendingRef.current?.kind === "source") {
        videos[pendingRef.current.index].current?.pause();
        pendingRef.current = null;
      }
      return;
    }

    const targetIndex = 1 - activeIndex;
    const token = ++nextTokenRef.current;
    const pending: PendingPlayback = {
      index: targetIndex,
      url: videoUrl,
      kind: "source",
      token,
    };
    pendingRef.current = pending;

    if (sources[targetIndex] !== videoUrl) {
      videos[targetIndex].current?.pause();
      setSources((previous) => {
        const next = [...previous] as [string | null, string | null];
        next[targetIndex] = videoUrl;
        return next;
      });
      setReady((previous) => {
        const next = [...previous] as [boolean, boolean];
        next[targetIndex] = false;
        return next;
      });
    } else if (
      ready[targetIndex] ||
      (videos[targetIndex].current?.readyState ?? 0) >=
        HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      startPendingPlayback(pending);
    }
  }, [
    activeIndex,
    beginTransition,
    ready,
    sources,
    startPendingPlayback,
    transition,
    videoUrl,
  ]);

  const handleTimeUpdate = (index: number) => {
    if (index !== activeIndex || transition) return;

    const active = videos[index].current;
    const standbyIndex = 1 - index;
    const standby = videos[standbyIndex].current;
    const source = sources[index];
    if (!active || !standby || !source || sources[standbyIndex] !== source) {
      return;
    }

    const remaining = active.duration - active.currentTime;
    const pending = pendingRef.current;
    if (pending) {
      if (pending.kind === "loop" && remaining <= 0.15) active.pause();
      return;
    }

    if (!Number.isFinite(remaining) || remaining > LOOP_HANDOFF_SECONDS) return;

    if (standby.currentTime > 0) standby.currentTime = 0;
    const nextPlayback: PendingPlayback = {
      index: standbyIndex,
      url: source,
      kind: "loop",
      token: ++nextTokenRef.current,
    };
    pendingRef.current = nextPlayback;
    if (standby.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      startPendingPlayback(nextPlayback);
    }
  };

  const { filter, scrimOpacity, glowOpacity } =
    getVideoBackgroundVisualStyle(intensity);
  const visualLayerOpacity =
    sources.some(Boolean) && transition?.to !== null ? 1 : 0;

  return (
    <>
      {videos.map((ref, index) => {
        const isTarget = transition?.to === index;
        const isSource = transition?.from === index;
        const opacity = transition
          ? isTarget
            ? 1
            : isSource
              ? 0
              : 0
          : activeIndex === index
            ? 1
            : 0;

        return (
          <video
            key={index}
            ref={ref}
            src={sources[index] ?? undefined}
            muted
            playsInline
            preload="auto"
            autoPlay={activeIndex === index}
            loop
            onLoadedData={() => handleLoadedData(index)}
            onPlaying={() => handlePlaying(index)}
            onTimeUpdate={() => handleTimeUpdate(index)}
            onError={() => handleError(index)}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter,
              opacity,
              transition: `opacity ${transition?.duration ?? SOURCE_CROSSFADE_MS}ms linear, filter 700ms ease`,
            }}
          />
        );
      })}
      <div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{
          opacity: scrimOpacity * visualLayerOpacity,
          transition: "opacity 700ms ease",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: glowOpacity * visualLayerOpacity,
          transition: "opacity 700ms ease",
          background:
            "radial-gradient(ellipse at center, rgba(255,208,140,0.9) 0%, rgba(255,208,140,0) 70%)",
          mixBlendMode: "screen",
        }}
      />
    </>
  );
}
