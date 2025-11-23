"use client";

import { useState, useEffect, useRef } from "react";
import { ImageAssociation, getImageUrl } from "@/lib/extract-images";

interface ArticleSidebarImagesProps {
  images: ImageAssociation[];
}

export function ArticleSidebarImages({ images }: ArticleSidebarImagesProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Only show on desktop (≥1280px)
    const checkDesktop = () => {
      setIsVisible(window.innerWidth >= 1280);
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    if (!isVisible || images.length === 0) return;

    // Create IntersectionObserver to track which paragraph is visible
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const paragraphId = entry.target.id;
            const imageIndex = images.findIndex(
              (img) => img.paragraphId === paragraphId
            );

            if (imageIndex !== -1) {
              setActiveImageIndex(imageIndex);
            }
          }
        });
      },
      {
        // Image changes when 40% of the paragraph is visible
        threshold: [0.4],
        // Focus on the middle zone of the viewport
        rootMargin: "-20% 0px -30% 0px",
      }
    );

    // Observe all paragraphs with images
    images.forEach((image) => {
      const paragraph = document.getElementById(image.paragraphId);
      if (paragraph && observerRef.current) {
        observerRef.current.observe(paragraph);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [images, isVisible]);

  // Preload next image for smooth transitions
  useEffect(() => {
    if (activeImageIndex < images.length - 1) {
      const nextImage = images[activeImageIndex + 1];
      const img = new Image();
      img.src = getImageUrl(nextImage.src);
    }
  }, [activeImageIndex, images]);

  if (!isVisible || images.length === 0) {
    return null;
  }

  const currentImage = images[activeImageIndex];

  return (
    <div className="hidden xl:block fixed left-8 top-32 w-80 2xl:w-96 z-30">
      <div className="sticky top-32">
        {/* Image container with smooth transitions */}
        <div className="relative w-full aspect-[4/3] bg-muted/30 rounded-xl overflow-hidden border border-border shadow-lg">
          {images.map((image, index) => (
            <div
              key={image.paragraphId}
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                index === activeImageIndex
                  ? "opacity-100 scale-100"
                  : index < activeImageIndex
                  ? "opacity-0 scale-95 -translate-y-4"
                  : "opacity-0 scale-95 translate-y-4"
              }`}
            >
              <img
                src={getImageUrl(image.src)}
                alt={image.alt}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                onLoad={() => {
                  setImageLoaded((prev) => ({ ...prev, [index]: true }));
                }}
              />

              {/* Loading skeleton */}
              {!imageLoaded[index] && (
                <div className="absolute inset-0 bg-muted/50 animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {/* Image counter and progress */}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Image {activeImageIndex + 1} / {images.length}
          </span>

          {/* Progress dots */}
          <div className="flex gap-1.5">
            {images.slice(0, 8).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeImageIndex
                    ? "w-6 bg-foreground"
                    : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
            {images.length > 8 && (
              <span className="text-xs ml-1">+{images.length - 8}</span>
            )}
          </div>
        </div>

        {/* Optional: Image caption (if alt text exists) */}
        {currentImage.alt && (
          <div className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {currentImage.alt}
          </div>
        )}

        {/* Section indicator */}
        {currentImage.sectionId && (
          <div className="mt-2 text-xs text-muted-foreground/60 italic">
            {currentImage.sectionId.replace(/-/g, " ")}
          </div>
        )}
      </div>
    </div>
  );
}
