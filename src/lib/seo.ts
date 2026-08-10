import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";

const RASTER_EXT = /\.(png|jpe?g|gif|webp)$/i;

export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, siteConfig.url).toString();
}

export function pickOgImage(src?: string | null): string | undefined {
  if (!src || !RASTER_EXT.test(src)) {
    return undefined;
  }
  return absoluteUrl(src);
}

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
}

export function buildPageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = pickOgImage(image);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: "it_IT",
      type,
      ...(ogImage
        ? {
            images: [{ url: ogImage }],
          }
        : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export function buildJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        name: `${siteConfig.name} | Portfolio`,
        url: siteConfig.url,
        description: siteConfig.description,
        inLanguage: "it-IT",
        publisher: { "@id": `${siteConfig.url}/#person` },
      },
      {
        "@type": "Person",
        "@id": `${siteConfig.url}/#person`,
        name: siteConfig.name,
        url: siteConfig.url,
        email: siteConfig.email,
        jobTitle: siteConfig.role.it,
        sameAs: [siteConfig.github, siteConfig.linkedin],
        affiliation: {
          "@type": "CollegeOrUniversity",
          name: "Politecnico di Torino",
        },
      },
    ],
  };
}
