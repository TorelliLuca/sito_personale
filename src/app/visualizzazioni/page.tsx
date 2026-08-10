import type { Metadata } from "next";
import { VisualizationsIndex } from "@/components/visualizations/visualizations-index";
import { getAllVisualizations } from "@/lib/visualizations";

export const metadata: Metadata = {
  title: "Visualizzazioni matematiche | Portfolio",
  description:
    "Simulazioni interattive con excursus teorico e scelte di implementazione.",
};

export default function VisualizzazioniPage() {
  const visualizations = getAllVisualizations();

  return <VisualizationsIndex visualizations={visualizations} />;
}
