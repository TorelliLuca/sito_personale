"use client";

import { useMemo } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { ProjectCard } from "@/components/project-card";
import { ProjectPreviewImage } from "@/components/project-preview-image";
import { LinkButton } from "@/components/link-button";
import { SectionHeading } from "@/components/section-heading";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Project } from "@/lib/types/project";

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  const { tr } = useLocale();

  const featured = useMemo(
    () => projects.filter((project) => project.featured),
    [projects]
  );
  const sideProjects = useMemo(
    () => projects.filter((project) => !project.featured),
    [projects]
  );

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="projects"
          title={tr("projectsTitle")}
          subtitle={tr("projectsSubtitle")}
        />

        {projects.length === 0 ? (
          <p className="text-muted-foreground">{tr("noProjects")}</p>
        ) : (
          <div className="space-y-12">
            {featured.length > 0 ? (
              <div>
                <h3 className="mb-4 font-heading text-lg font-semibold tracking-tight">
                  {tr("featuredProjects")}
                </h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  {featured.map((project, index) => (
                    <ProjectCard
                      key={project.slug}
                      project={project}
                      priority={index === 0}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {sideProjects.length > 0 ? (
              <div>
                <h3 className="mb-4 font-heading text-lg font-semibold tracking-tight">
                  {tr("sideProjects")}
                </h3>
                <Carousel className="w-full">
                  <CarouselContent>
                    {sideProjects.map((project) => {
                      const cover = project.images[0] ?? null;
                      return (
                        <CarouselItem
                          key={project.slug}
                          className="basis-[85%] sm:basis-1/2 lg:basis-1/3"
                        >
                          <div className="overflow-hidden rounded-xl border border-border bg-card">
                            <div className="relative aspect-[16/10] bg-black">
                              <ProjectPreviewImage
                                image={cover}
                                sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                              <div className="absolute bottom-4 left-4 right-4">
                                <h4 className="font-heading text-lg font-semibold text-white">
                                  {project.title}
                                </h4>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {project.tags.slice(0, 3).map((tag) => (
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
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
