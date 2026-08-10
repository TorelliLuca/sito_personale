import fs from "fs";
import path from "path";
import type { Project } from "@/lib/types/project";

const projectsDirectory = path.join(process.cwd(), "content/projects");

export function getAllProjects(): Project[] {
  if (!fs.existsSync(projectsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(projectsDirectory)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(projectsDirectory, file), "utf8");
      return JSON.parse(raw) as Project;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getAllProjects().find((project) => project.slug === slug);
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const project of getAllProjects()) {
    for (const tag of project.tags) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort();
}

export function getFeaturedProjects(): Project[] {
  return getAllProjects().filter((project) => project.featured);
}

export function getSideProjects(): Project[] {
  return getAllProjects().filter((project) => !project.featured);
}

export function getMinorProjects(): Project[] {
  return getSideProjects();
}

export function getShowcaseProjects(): Project[] {
  return getAllProjects().filter(
    (project) =>
      project.type === "demo" ||
      project.type === "hybrid" ||
      Boolean(project.demoSlug)
  );
}
