import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { GithubIcon } from "@/components/icons/social";
import { Badge } from "@/components/ui/badge";
import { AnchorButton, LinkButton } from "@/components/link-button";
import { ProjectCarousel } from "@/components/project-carousel";
import { ProjectRoadmap } from "@/components/project-roadmap";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return { title: "Progetto non trovato" };
  }

  return {
    title: `${project.title} | Portfolio`,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <LinkButton href="/#projects" variant="ghost" size="sm" className="mb-8">
        <ArrowLeft className="size-4" />
        Home
      </LinkButton>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          {project.title}
        </h1>
        <p className="text-lg text-muted-foreground">{project.description}</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {project.links.github ? (
          <AnchorButton
            href={project.links.github}
            target="_blank"
            rel="noreferrer"
            variant="outline"
          >
            <GithubIcon className="size-4 text-[#2563EB]" />
            GitHub
          </AnchorButton>
        ) : null}
        {project.demoSlug ? (
          <LinkButton href={`/demos/${project.demoSlug}`}>
            <ExternalLink className="size-4" />
            Demo interattiva
          </LinkButton>
        ) : null}
        {project.links.live ? (
          <AnchorButton
            href={project.links.live}
            target="_blank"
            rel="noreferrer"
            variant="outline"
          >
            <ExternalLink className="size-4" />
            Live
          </AnchorButton>
        ) : null}
      </div>

      {(project.type === "gallery" || project.type === "hybrid") &&
      project.images.length > 0 ? (
        <div className="mt-10">
          <ProjectCarousel images={project.images} title={project.title} />
        </div>
      ) : null}

      {project.roadmap && project.roadmap.length > 0 ? (
        <ProjectRoadmap
          versions={project.roadmap}
          projectTitle={project.title}
        />
      ) : null}
    </main>
  );
}
