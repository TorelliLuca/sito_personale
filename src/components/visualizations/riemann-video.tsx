"use client";

export function RiemannVideo() {
  return (
    <video
      className="h-full w-full object-contain bg-background"
      src="/visualizations/riemann/riemann.mp4"
      controls
      playsInline
      preload="metadata"
      aria-label="Animazione somme di Riemann e convergenza all'integrale definito"
    />
  );
}
