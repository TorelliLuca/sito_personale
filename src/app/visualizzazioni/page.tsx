import type { Metadata } from "next";
import { VisualizationsIndex } from "@/components/visualizations/visualizations-index";
import { buildPageMetadata } from "@/lib/seo";
import { getAllVisualizations } from "@/lib/visualizations";

export const metadata: Metadata = buildPageMetadata({
  title: "Visualizzazioni matematiche",
  description:
    "Simulazioni interattive con excursus teorico e scelte di implementazione.",
  path: "/visualizzazioni",
});

export default function VisualizzazioniPage() {
  const visualizations = getAllVisualizations();

  return <VisualizationsIndex visualizations={visualizations} />;
}
