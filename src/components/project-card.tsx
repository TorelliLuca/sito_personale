"use client";

import Link from "next/link";
import { ProjectPreviewImage } from "@/components/project-preview-image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LinkButton } from "@/components/link-button";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Project } from "@/lib/types/project";

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
}

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  const { tr } = useLocale();
  const cover = project.images[0];

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-black transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
          <ProjectPreviewImage image={cover} priority={priority} />
        </div>
      </Link>

      <CardHeader>
        <div className="mb-2 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <CardTitle>{project.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {project.description}
        </CardDescription>
      </CardHeader>

      <CardFooter className="gap-2">
        <LinkButton href={`/projects/${project.slug}`} size="sm">
          {tr("viewProject")}
        </LinkButton>
        {project.demoSlug ? (
          <LinkButton
            href={`/demos/${project.demoSlug}`}
            size="sm"
            variant="outline"
          >
            {tr("openDemo")}
          </LinkButton>
        ) : null}
      </CardFooter>
    </Card>
  );
}
