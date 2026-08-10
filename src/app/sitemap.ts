import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";
import { getAvailableDemoSlugs } from "@/lib/demos";
import { getAllProjects, getProjectByDemoSlug } from "@/lib/projects";
import { absoluteUrl } from "@/lib/seo";
import { getAllVisualizations } from "@/lib/visualizations";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/visualizzazioni"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const projects = getAllProjects().map((project) => ({
    url: absoluteUrl(`/projects/${project.slug}`),
    lastModified: new Date(project.createdAt),
    changeFrequency: "monthly" as const,
    priority: project.featured ? 0.9 : 0.7,
  }));

  const visualizations = getAllVisualizations().map((visualization) => ({
    url: absoluteUrl(`/visualizzazioni/${visualization.slug}`),
    lastModified: new Date(visualization.createdAt),
    changeFrequency: "monthly" as const,
    priority: visualization.featured ? 0.8 : 0.6,
  }));

  const demos = getAvailableDemoSlugs().map((slug) => {
    const project = getProjectByDemoSlug(slug);
    return {
      url: absoluteUrl(`/demos/${slug}`),
      lastModified: project ? new Date(project.createdAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

  return [...staticRoutes, ...projects, ...visualizations, ...demos];
}
