import type { Locale } from "@/lib/i18n/translations";

export type LocalizedString = Record<Locale, string>;

export interface VisualizationSection {
  title: LocalizedString;
  body: LocalizedString;
  /** Blocchi LaTeX in display mode. */
  formulas?: string[];
  note?: LocalizedString;
  /** Formula inline dopo la nota. */
  inlineFormula?: string;
}

export interface Visualization {
  slug: string;
  /** Chiave del componente simulazione registrato in `simulationMap`. */
  simulation: string;
  featured: boolean;
  tags: string[];
  createdAt: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  description: LocalizedString;
  intro: LocalizedString;
  theory: VisualizationSection[];
  design: VisualizationSection[];
}
