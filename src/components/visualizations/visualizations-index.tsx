"use client";

import { ArrowLeft } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { VisualizationCard } from "@/components/visualizations/visualization-card";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Visualization } from "@/lib/types/visualization";

interface VisualizationsIndexProps {
  visualizations: Visualization[];
}

export function VisualizationsIndex({
  visualizations,
}: VisualizationsIndexProps) {
  const { tr } = useLocale();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <LinkButton href="/#visualizzazioni" variant="ghost" size="sm" className="mb-8">
        <ArrowLeft className="size-4" />
        {tr("backHome")}
      </LinkButton>

      <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {tr("visualizations")}
      </p>
      <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
        {tr("visualizationsTitle")}
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        {tr("visualizationsPageSubtitle")}
      </p>

      <div className="mt-12">
        {visualizations.length === 0 ? (
          <p className="text-muted-foreground">{tr("noVisualizations")}</p>
        ) : (
          visualizations.map((visualization) => (
            <VisualizationCard
              key={visualization.slug}
              visualization={visualization}
            />
          ))
        )}
      </div>
    </main>
  );
}
