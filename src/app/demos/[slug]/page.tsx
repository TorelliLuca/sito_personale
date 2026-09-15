import type { Metadata } from "next";
import { DemoLoader } from "@/components/demos/demo-loader";
import { DemoShell } from "@/components/demos/demo-shell";
import { getAvailableDemoSlugs } from "@/lib/demos";
import { getProjectByDemoSlug } from "@/lib/projects";
import { buildPageMetadata } from "@/lib/seo";

interface DemoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAvailableDemoSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: DemoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectByDemoSlug(slug);

  if (!project) {
    return buildPageMetadata({
      title: `Demo ${slug}`,
      description: "Demo interattiva del portfolio.",
      path: `/demos/${slug}`,
    });
  }

  return buildPageMetadata({
    title: `Demo · ${project.title}`,
    description: project.description,
    path: `/demos/${slug}`,
    image: project.images[0]?.src,
  });
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { slug } = await params;
  const project = getProjectByDemoSlug(slug);

  return (
    <DemoShell
      title={project?.title ?? slug}
      description={project?.description}
      showControlsHint={slug !== "rl-visualization"}
    >
      <DemoLoader slug={slug} />
    </DemoShell>
  );
}
