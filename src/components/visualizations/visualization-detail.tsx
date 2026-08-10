"use client";

import { ArrowLeft } from "lucide-react";
import { Math, MathBlock, MathGroup } from "@/components/math/math";
import { LinkButton } from "@/components/link-button";
import { Badge } from "@/components/ui/badge";
import { SimulationStage } from "@/components/visualizations/simulation-stage";
import { useLocale } from "@/lib/i18n/locale-context";
import type {
  Visualization,
  VisualizationSection,
} from "@/lib/types/visualization";

interface VisualizationDetailProps {
  visualization: Visualization;
}

function SectionBlock({ section }: { section: VisualizationSection }) {
  const { locale } = useLocale();

  return (
    <section className="space-y-4">
      <h3 className="font-heading text-2xl font-semibold tracking-tight">
        {section.title[locale]}
      </h3>
      <p className="leading-relaxed text-muted-foreground">
        {section.body[locale]}
      </p>

      {section.formulas?.length || section.note || section.inlineFormula ? (
        <MathGroup>
          {section.formulas?.map((formula) => (
            <MathBlock key={formula}>{formula}</MathBlock>
          ))}
          {section.note || section.inlineFormula ? (
            <p className="leading-relaxed text-muted-foreground">
              {section.note ? section.note[locale] : null}
              {section.note && section.inlineFormula ? " " : null}
              {section.inlineFormula ? (
                <Math inline>{section.inlineFormula}</Math>
              ) : null}
            </p>
          ) : null}
        </MathGroup>
      ) : null}
    </section>
  );
}

export function VisualizationDetail({
  visualization,
}: VisualizationDetailProps) {
  const { locale, tr } = useLocale();

  return (
    <main>
      <section className="border-b border-border/60 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <LinkButton
            href="/visualizzazioni"
            variant="ghost"
            size="sm"
            className="mb-8"
          >
            <ArrowLeft className="size-4" />
            {tr("backToVisualizations")}
          </LinkButton>

          <div className="mb-4 flex flex-wrap gap-2">
            {visualization.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {tr("visualizations")}
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            {visualization.title[locale]}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {visualization.subtitle[locale]}
          </p>

          <div className="mt-10">
            <SimulationStage simulation={visualization.simulation} />
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
        <p className="text-lg leading-relaxed text-muted-foreground">
          {visualization.intro[locale]}
        </p>

        <div className="mt-14 space-y-6">
          <h2 className="font-heading text-3xl font-semibold tracking-tight">
            {tr("visualizationTheory")}
          </h2>
          <div className="space-y-12">
            {visualization.theory.map((section) => (
              <SectionBlock
                key={section.title.it}
                section={section}
              />
            ))}
          </div>
        </div>

        <div className="mt-16 space-y-6">
          <h2 className="font-heading text-3xl font-semibold tracking-tight">
            {tr("visualizationDesign")}
          </h2>
          <div className="space-y-12">
            {visualization.design.map((section) => (
              <SectionBlock
                key={section.title.it}
                section={section}
              />
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
