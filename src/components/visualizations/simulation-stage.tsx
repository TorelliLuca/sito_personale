"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const ChladniSimulation = dynamic(
  () =>
    import("@/components/chladni-background").then((mod) => ({
      default: function ChladniPanel() {
        return <mod.ChladniBackground variant="panel" />;
      },
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        …
      </div>
    ),
  }
);

const RiemannSimulation = dynamic(
  () =>
    import("@/components/visualizations/riemann-video").then((mod) => ({
      default: mod.RiemannVideo,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        …
      </div>
    ),
  }
);

const UnionFindKirchhoffSimulation = dynamic(
  () =>
    import("@/components/visualizations/union-find-kirchhoff-media").then(
      (mod) => ({
        default: mod.UnionFindKirchhoffMedia,
      })
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        …
      </div>
    ),
  }
);

const LorenzSimulation = dynamic(
  () =>
    import("@/components/visualizations/lorenz-video").then((mod) => ({
      default: mod.LorenzVideo,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        …
      </div>
    ),
  }
);

const simulationMap: Record<string, ComponentType> = {
  chladni: ChladniSimulation,
  riemann: RiemannSimulation,
  lorenz: LorenzSimulation,
  "union-find-kirchhoff": UnionFindKirchhoffSimulation,
};

interface SimulationStageProps {
  simulation: string;
  className?: string;
}

export function SimulationStage({
  simulation,
  className,
}: SimulationStageProps) {
  const Simulation = simulationMap[simulation];

  const defaultFrameClass =
    simulation === "union-find-kirchhoff"
      ? "relative min-h-[28rem] aspect-[4/5] sm:aspect-[5/4] overflow-hidden border border-border/60 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08),transparent_65%)]"
      : "relative aspect-[16/10] overflow-hidden border border-border/60 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08),transparent_65%)]";

  if (!Simulation) {
    return (
      <div
        className={
          className ??
          "flex aspect-[16/10] items-center justify-center border border-border/60 bg-muted/40 text-sm text-muted-foreground"
        }
      >
        Simulazione non trovata
      </div>
    );
  }

  return (
    <div className={className ?? defaultFrameClass}>
      <Simulation />
    </div>
  );
}
