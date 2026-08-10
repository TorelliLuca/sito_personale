import type { ProjectImage } from "@/lib/types/project";

const VIDEO_EXT = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;

export function isVideoSrc(src: string) {
  return VIDEO_EXT.test(src);
}

export function isGifSrc(src: string) {
  return src.toLowerCase().endsWith(".gif");
}

export function isSvgSrc(src: string) {
  return src.toLowerCase().endsWith(".svg");
}

/** Prima media usabile come cover, o null se assente. */
export function getProjectCover(
  images: ProjectImage[] | undefined,
): ProjectImage | null {
  return images?.[0] ?? null;
}
