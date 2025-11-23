"use client";

import { useState, useEffect, useRef } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { ImageAssociation, getImageUrl } from "@/lib/extract-images";

interface ArticleSidebarImagesProps {
  images: ImageAssociation[];
}

export function ArticleSidebarImages({ images }: ArticleSidebarImagesProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const [modalImage, setModalImage] = useState<string | null>(null);
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

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalImage) {
        setModalImage(null);
      }
    };

    if (modalImage) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [modalImage]);

  if (!isVisible || images.length === 0) {
    return null;
  }

  const currentImage = images[activeImageIndex];

  return (
    <>
      <div className="hidden xl:block fixed left-8 top-32 w-80 2xl:w-96 z-30">
        <div className="sticky top-32">
          {/* Image container with smooth transitions */}
          <div
            className="relative w-full aspect-[4/3] bg-muted/30 rounded-xl overflow-hidden border border-border shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setModalImage(getImageUrl(currentImage.src))}
          >
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
        </div>
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={() => setModalImage(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setModalImage(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all z-[101]"
            aria-label="Close image"
          >
            <Cross2Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>

          {/* Image container */}
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8">
            <img
              src={modalImage}
              alt="Enlarged view"
              className="shadow-2xl max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
