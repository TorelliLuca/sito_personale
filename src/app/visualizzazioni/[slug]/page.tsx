import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VisualizationDetail } from "@/components/visualizations/visualization-detail";
import { buildPageMetadata } from "@/lib/seo";
import {
  getAllVisualizations,
  getVisualizationBySlug,
} from "@/lib/visualizations";

interface VisualizationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllVisualizations().map((visualization) => ({
    slug: visualization.slug,
  }));
}

export async function generateMetadata({
  params,
}: VisualizationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const visualization = getVisualizationBySlug(slug);

  if (!visualization) {
    return { title: "Visualizzazione non trovata" };
  }

  return buildPageMetadata({
    title: visualization.title.it,
    description: visualization.description.it,
    path: `/visualizzazioni/${visualization.slug}`,
    type: "article",
  });
}

export default async function VisualizationPage({
  params,
}: VisualizationPageProps) {
  const { slug } = await params;
  const visualization = getVisualizationBySlug(slug);

  if (!visualization) {
    notFound();
  }

  return <VisualizationDetail visualization={visualization} />;
}
