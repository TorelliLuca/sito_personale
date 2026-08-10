"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import {
  isGifSrc,
  isSvgSrc,
  isVideoSrc,
} from "@/lib/project-media";
import { cn } from "@/lib/utils";
import type { ProjectImage } from "@/lib/types/project";

interface ProjectPreviewImageProps {
  image?: ProjectImage | null;
  priority?: boolean;
  sizes?: string;
  className?: string;
  /** Controlli nativi sul video (pagina progetto). In card: autoplay muted loop. */
  videoControls?: boolean;
}

function MediaFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn("absolute inset-0 bg-black", className)}
      aria-hidden
    />
  );
}

export function ProjectPreviewImage({
  image,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  className,
  videoControls = false,
}: ProjectPreviewImageProps) {
  const [showHover, setShowHover] = useState(false);
  const [failed, setFailed] = useState(false);
  const hasHover = Boolean(image?.hoverSrc) && !isVideoSrc(image?.src ?? "");

  const reveal = useCallback(() => {
    if (hasHover) {
      setShowHover(true);
    }
  }, [hasHover]);

  const hide = useCallback(() => {
    setShowHover(false);
  }, []);

  if (!image || failed) {
    return <MediaFallback className={className} />;
  }

  if (isVideoSrc(image.src)) {
    return (
      <video
        src={image.src}
        className={cn(
          "absolute inset-0 h-full w-full object-cover",
          className,
        )}
        muted
        autoPlay
        loop
        playsInline
        controls={videoControls}
        preload="metadata"
        aria-label={image.alt}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={cn("relative h-full w-full", className)}
      onMouseEnter={reveal}
      onMouseLeave={hide}
      onTouchStart={reveal}
      onTouchEnd={hide}
      onTouchCancel={hide}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority={priority}
        placeholder={
          image.blurDataURL && !isSvgSrc(image.src) ? "blur" : "empty"
        }
        blurDataURL={
          image.blurDataURL && !isSvgSrc(image.src)
            ? image.blurDataURL
            : undefined
        }
        sizes={sizes}
        className={cn(
          "object-cover transition-opacity duration-300 motion-reduce:transition-none",
          hasHover && showHover ? "opacity-0" : "opacity-100",
        )}
        onError={() => setFailed(true)}
      />
      {image.hoverSrc ? (
        <Image
          src={image.hoverSrc}
          alt=""
          aria-hidden
          fill
          unoptimized={isGifSrc(image.hoverSrc)}
          sizes={sizes}
          className={cn(
            "object-cover transition-opacity duration-300 motion-reduce:transition-none",
            showHover ? "opacity-100" : "opacity-0",
          )}
          onError={() => setFailed(true)}
        />
      ) : null}
    </div>
  );
}
