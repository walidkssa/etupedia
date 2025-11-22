"use client";

import Image from "next/image";
import { useState } from "react";

interface ArticleHeroProps {
  title: string;
  image?: string;
}

export function ArticleHeroV2({ title, image }: ArticleHeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!image) {
    return (
      <div className="w-full bg-muted flex items-center justify-center" style={{ height: "30vh", minHeight: "240px" }}>
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
    <div className="relative w-full bg-muted" style={{ height: "30vh", minHeight: "240px" }}>
      <Image
        src={image}
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
