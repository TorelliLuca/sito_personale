"use client";

import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { LinkButton } from "@/components/link-button";
import { ProjectPreviewImage } from "@/components/project-preview-image";
import { SectionHeading } from "@/components/section-heading";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Project } from "@/lib/types/project";

interface ShowcaseSectionProps {
  projects: Project[];
}

export function ShowcaseSection({ projects }: ShowcaseSectionProps) {
  const { tr } = useLocale();

  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="showcase"
          title={tr("showcaseTitle")}
          subtitle={tr("showcaseSubtitle")}
        />

        <Carousel className="w-full">
          <CarouselContent>
            {projects.map((project) => {
              const cover = project.images[0] ?? null;
              return (
                <CarouselItem key={project.slug} className="md:basis-1/2">
                  <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <div className="relative aspect-[16/10] bg-black">
                      <ProjectPreviewImage
                        image={cover}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                        <div>
                          <h3 className="font-heading text-xl font-semibold text-white">
                            {project.title}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {project.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="bg-white/15 text-white"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {project.demoSlug ? (
                          <LinkButton href={`/demos/${project.demoSlug}`} size="sm">
                            <Play className="size-4" />
                            {tr("openDemo")}
                          </LinkButton>
                        ) : null}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {project.description}
                      </p>
                      <LinkButton
                        href={`/projects/${project.slug}`}
                        variant="link"
                        className="mt-2 px-0"
                      >
                        {tr("viewProject")}
                      </LinkButton>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>
    </section>
  );
}
