import type { LocalizedString } from "@/lib/types/visualization";
import type { Locale } from "@/lib/i18n/translations";

export type ProjectType = "gallery" | "demo" | "hybrid";

/** Testo roadmap: stringa legacy oppure `{ it, en }`. */
export type ProjectLocalizedText = string | LocalizedString;

export interface ProjectImage {
  src: string;
  alt: string;
  /** GIF o immagine animata mostrata al passaggio del mouse (card) o al tocco (mobile). */
  hoverSrc?: string;
  blurDataURL?: string;
}

export interface ProjectLinks {
  github?: string | null;
  live?: string | null;
}

/** Una tappa della roadmap: versione, scelte fatte, foto opzionali. */
export interface ProjectRoadmapVersion {
  /** Etichetta versione, es. "0.1", "1.0", "v2". */
  version: string;
  /** Titolo breve della tappa (stringa o `{ it, en }`). */
  title: ProjectLocalizedText;
  /** Descrizione delle scelte e del lavoro fatto in questa versione. */
  description: ProjectLocalizedText;
  /** Data ISO (`YYYY-MM-DD`), usata per l'ordinamento e la visualizzazione. */
  date?: string;
  /** SHA commit di origine (sync GitHub); usato per preservare testi IT curati. */
  commitSha?: string;
  /** Foto associate a questa versione. */
  images?: ProjectImage[];
}

/** Risolve un testo progetto nella lingua attiva, con fallback sull'altra. */
export function resolveProjectText(
  value: ProjectLocalizedText | undefined,
  locale: Locale
): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  const primary = value[locale]?.trim();
  if (primary) return primary;
  const fallback = locale === "it" ? value.en : value.it;
  return fallback?.trim() ?? "";
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  type: ProjectType;
  demoSlug?: string | null;
  featured: boolean;
  images: ProjectImage[];
  /** Roadmap delle versioni fino allo stato attuale. */
  roadmap?: ProjectRoadmapVersion[];
  links: ProjectLinks;
  createdAt: string;
}
