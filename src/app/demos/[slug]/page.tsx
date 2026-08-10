import { DemoLoader } from "@/components/demos/demo-loader";
import { DemoShell } from "@/components/demos/demo-shell";
import { getAvailableDemoSlugs } from "@/lib/demos";
import { getProjectBySlug } from "@/lib/projects";

interface DemoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAvailableDemoSlugs().map((slug) => ({ slug }));
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  return (
    <DemoShell
      title={project?.title ?? slug}
      description={project?.description}
    >
      <DemoLoader slug={slug} />
    </DemoShell>
  );
}
