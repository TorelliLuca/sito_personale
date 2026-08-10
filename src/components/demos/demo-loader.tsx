"use client";

import dynamic from "next/dynamic";
import type { DemoSlug } from "@/lib/demos";

const demoMap = {
  "rl-visualization": dynamic(
    () =>
      import("@/components/demos/rl-visualization").then(
        (mod) => mod.RlVisualizationDemo
      ),
    {
      ssr: false,
      loading: () => (
        <div className="flex h-[calc(100vh-73px)] items-center justify-center text-muted-foreground">
          Loading demo...
        </div>
      ),
    }
  ),
} as const satisfies Record<DemoSlug, ReturnType<typeof dynamic>>;

interface DemoLoaderProps {
  slug: string;
}

export function DemoLoader({ slug }: DemoLoaderProps) {
  const DemoComponent = demoMap[slug as DemoSlug];

  if (!DemoComponent) {
    return (
      <div className="flex h-[calc(100vh-73px)] items-center justify-center text-muted-foreground">
        Demo not found
      </div>
    );
  }

  return <DemoComponent />;
}
