"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProjectPreviewImage } from "@/components/project-preview-image";
import type { ProjectImage } from "@/lib/types/project";

interface ProjectCarouselProps {
  images: ProjectImage[];
  title: string;
}

export function ProjectCarousel({ images, title }: ProjectCarouselProps) {
  if (images.length === 0) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-black">
        <ProjectPreviewImage image={null} />
      </div>
    );
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={image.src}>
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-black">
              <ProjectPreviewImage
                image={image}
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 896px"
                videoControls
              />
              <span className="sr-only">
                {image.alt || `${title} - ${index + 1}`}
              </span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {images.length > 1 ? (
        <>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </>
      ) : null}
    </Carousel>
  );
}
