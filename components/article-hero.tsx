"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface ArticleHeroProps {
  title: string;
  image?: string;
}

export function ArticleHero({ title, image }: ArticleHeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (image) {
      // Handle Wikipedia images
      if (image.includes("wikipedia.org") || image.includes("wikimedia.org")) {
        setImageSrc(image);
      } else {
        setImageSrc(image);
      }
    }
  }, [image]);

  if (!imageSrc) {
    return (
      <div className="w-full bg-muted flex items-center justify-center" style={{ height: "40vh", minHeight: "300px" }}>
        <svg
          width="80"
          height="80"
          viewBox="0 0 32 32"
          fill="none"
          className="text-muted-foreground opacity-20"
        >
          <path
            d="M8 4L4 28H10L12 18H20L22 28H28L24 4H18L16 14H12L14 4H8Z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-muted" style={{ height: "40vh", minHeight: "300px" }}>
      <Image
        src={imageSrc}
        alt={title}
        fill
        className={`object-cover transition-opacity duration-300 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setImageLoaded(true)}
        priority
        sizes="100vw"
      />
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-foreground/50 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
