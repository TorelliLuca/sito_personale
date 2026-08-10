"use client";

export function LorenzVideo() {
  return (
    <video
      className="h-full w-full object-contain bg-background"
      src="/visualizations/lorenz/lorenz.mp4"
      controls
      playsInline
      preload="metadata"
      aria-label="Animazione attrattore di Lorenz e dipendenza sensibile dalle condizioni iniziali"
    />
  );
}
