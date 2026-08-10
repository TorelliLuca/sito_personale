"use client";

import { SectionHeading } from "@/components/section-heading";
import { VisualizationCard } from "@/components/visualizations/visualization-card";
import { LinkButton } from "@/components/link-button";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Visualization } from "@/lib/types/visualization";

interface VisualizationsSectionProps {
  visualizations: Visualization[];
}

export function VisualizationsSection({
  visualizations,
}: VisualizationsSectionProps) {
  const { tr } = useLocale();
  const preview = visualizations.slice(0, 2);

  if (preview.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-border/40 bg-[linear-gradient(180deg,transparent,rgba(37,99,235,0.04),transparent)] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="visualizzazioni"
          title={tr("visualizationsTitle")}
          subtitle={tr("visualizationsSubtitle")}
        />

        <div>
          {preview.map((visualization) => (
            <VisualizationCard
              key={visualization.slug}
              visualization={visualization}
            />
          ))}
        </div>

        <div className="mt-8">
          <LinkButton href="/visualizzazioni" variant="ghost">
            {tr("allVisualizations")}
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
