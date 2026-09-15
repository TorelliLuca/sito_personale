"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ProjectCarousel } from "@/components/project-carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/translations";
import type {
  ProjectLocalizedText,
  ProjectRoadmapVersion,
} from "@/lib/types/project";

const VISIBLE_STEPS = 5;

interface ProjectRoadmapProps {
  versions: ProjectRoadmapVersion[];
  projectTitle: string;
}

function roadmapText(
  value: ProjectLocalizedText | undefined,
  locale: Locale
): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const localized = value as { it?: string; en?: string };
    const primary = localized[locale];
    if (typeof primary === "string" && primary.trim()) return primary;
    const fallback = locale === "it" ? localized.en : localized.it;
    if (typeof fallback === "string") return fallback;
  }
  return "";
}

function formatDate(date: string, locale: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "it-IT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed);
}

function sortVersions(versions: ProjectRoadmapVersion[]): ProjectRoadmapVersion[] {
  return [...versions].sort((b, a) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    if (dateA !== dateB) {
      return dateA - dateB;
    }
    return a.version.localeCompare(b.version, undefined, { numeric: true });
  });
}

export function ProjectRoadmap({ versions, projectTitle }: ProjectRoadmapProps) {
  const { locale, tr } = useLocale();
  const [expanded, setExpanded] = useState(false);

  if (versions.length === 0) {
    return null;
  }

  const ordered = sortVersions(versions);
  const canCollapse = ordered.length > VISIBLE_STEPS;
  const visible = expanded || !canCollapse
    ? ordered
    : ordered.slice(0, VISIBLE_STEPS);
  const hiddenCount = ordered.length - VISIBLE_STEPS;

  return (
    <section className="mt-14 space-y-8" aria-labelledby="project-roadmap-heading">
      <div className="space-y-2">
        <h2
          id="project-roadmap-heading"
          className="font-heading text-2xl font-semibold tracking-tight"
        >
          {tr("projectRoadmap")}
        </h2>
        <p className="text-muted-foreground">{tr("projectRoadmapSubtitle")}</p>
      </div>

      <ol className="relative space-y-10 border-l border-border/80 pl-6 sm:pl-8">
        {visible.map((entry, index) => {
          const isLatest = index === 0;
          const images = entry.images ?? [];
          const title = roadmapText(entry.title, locale);
          const description = roadmapText(entry.description, locale);

          return (
            <li
              key={`${entry.commitSha ?? entry.version}-${title}`}
              className="relative"
            >
              <span
                className={`absolute top-1.5 left-[-1.55rem] size-3 rounded-full border-2 border-background sm:left-[-2.05rem] ${
                  isLatest ? "bg-accent" : "bg-muted-foreground/50"
                }`}
                aria-hidden
              />

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={isLatest ? "default" : "secondary"}>
                    {tr("projectVersion")} {entry.version}
                  </Badge>
                  {isLatest ? (
                    <Badge variant="outline">{tr("projectVersionCurrent")}</Badge>
                  ) : null}
                  {entry.date ? (
                    <time
                      dateTime={entry.date}
                      className="text-sm text-muted-foreground"
                    >
                      {formatDate(entry.date, locale)}
                    </time>
                  ) : null}
                </div>

                <h3 className="font-heading text-xl font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {description}
                </p>

                {images.length > 0 ? (
                  <div className="pt-2">
                    <ProjectCarousel
                      images={images}
                      title={`${projectTitle} — ${entry.version}`}
                    />
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {canCollapse ? (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? (
              <>
                <ChevronUp className="size-4" />
                {tr("projectRoadmapCollapse")}
              </>
            ) : (
              <>
                <ChevronDown className="size-4" />
                {tr("projectRoadmapExpand")}
                {hiddenCount > 0 ? ` (${hiddenCount})` : null}
              </>
            )}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
