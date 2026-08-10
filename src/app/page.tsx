import { ContactSection } from "@/components/sections/contact";
import { HeroSection } from "@/components/sections/hero";
import { ProfileSection } from "@/components/sections/profile";
import { ShowcaseSection } from "@/components/sections/showcase";
import { SkillsSection } from "@/components/sections/skills";
import { VisualizationsSection } from "@/components/sections/visualizations";
import { ProjectGrid } from "@/components/project-grid";
import { getAllProjects, getShowcaseProjects } from "@/lib/projects";
import { getAllVisualizations } from "@/lib/visualizations";

export default function Home() {
  const projects = getAllProjects();
  const showcaseProjects = getShowcaseProjects();
  const visualizations = getAllVisualizations();

  return (
    <main>
      <HeroSection />
      <ProfileSection />
      <SkillsSection />
      <ProjectGrid projects={projects} />
      <VisualizationsSection visualizations={visualizations} />
      <ShowcaseSection projects={showcaseProjects} />
      <ContactSection />
    </main>
  );
}
