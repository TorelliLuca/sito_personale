export type ProjectType = "gallery" | "demo" | "hybrid";

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
  /** Titolo breve della tappa. */
  title: string;
  /** Descrizione delle scelte e del lavoro fatto in questa versione. */
  description: string;
  /** Data ISO (`YYYY-MM-DD`), usata per l'ordinamento e la visualizzazione. */
  date?: string;
  /** Foto associate a questa versione. */
  images?: ProjectImage[];
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
