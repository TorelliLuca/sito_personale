import fs from "fs";
import path from "path";
import type { Visualization } from "@/lib/types/visualization";

const visualizationsDirectory = path.join(
  process.cwd(),
  "content/visualizations"
);

export function getAllVisualizations(): Visualization[] {
  if (!fs.existsSync(visualizationsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(visualizationsDirectory)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const raw = fs.readFileSync(
        path.join(visualizationsDirectory, file),
        "utf8"
      );
      return JSON.parse(raw) as Visualization;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function getVisualizationBySlug(
  slug: string
): Visualization | undefined {
  return getAllVisualizations().find((viz) => viz.slug === slug);
}

export function getFeaturedVisualizations(): Visualization[] {
  return getAllVisualizations().filter((viz) => viz.featured);
}
