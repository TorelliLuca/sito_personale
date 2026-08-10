"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Visualization } from "@/lib/types/visualization";

interface VisualizationCardProps {
  visualization: Visualization;
}

export function VisualizationCard({ visualization }: VisualizationCardProps) {
  const { locale, tr } = useLocale();

  return (
    <article className="group border-b border-border/60 py-8 first:pt-0 last:border-b-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-3">
          <div className="flex flex-wrap gap-2">
            {visualization.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <h3 className="font-heading text-2xl font-semibold tracking-tight transition-colors group-hover:text-[#2563EB]">
            <Link href={`/visualizzazioni/${visualization.slug}`}>
              {visualization.title[locale]}
            </Link>
          </h3>
          <p className="text-muted-foreground">
            {visualization.description[locale]}
          </p>
        </div>

        <LinkButton
          href={`/visualizzazioni/${visualization.slug}`}
          variant="outline"
          size="sm"
          className="shrink-0"
        >
          {tr("exploreVisualization")}
          <ArrowRight className="size-4" />
        </LinkButton>
      </div>
    </article>
  );
}
