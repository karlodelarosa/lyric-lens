import { getVideoBackgroundVisualStyle } from "../../lib/sectionIntensity";

export function VideoBackground({
  videoUrl,
  intensity = 50,
}: {
  videoUrl: string | null;
  intensity?: number;
}) {
  if (!videoUrl) return null;

  const { filter, scrimOpacity, glowOpacity } =
    getVideoBackgroundVisualStyle(intensity);

  return (
    <>
      <video
        key={videoUrl}
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter, transition: "filter 700ms ease" }}
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
