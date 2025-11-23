"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  coverImage?: string;
  children: React.ReactNode;
  height?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  coverImage,
  children,
  height = "50vh",
}: BottomSheetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsAnimating(true);
      setCurrentTranslate(0);
    } else {
      document.body.style.overflow = "unset";
      setCurrentTranslate(0);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    setDragStartY(clientY);
    setIsAnimating(false);
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;

    const deltaY = clientY - dragStartY;
    if (deltaY > 0) {
      setCurrentTranslate(deltaY);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsAnimating(true);

    if (currentTranslate > 100) {
      onClose();
    } else {
      setCurrentTranslate(0);
    }

    setDragStartY(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleDragMove(e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragStartY]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Background image with blur */}
      {coverImage && (
        <div className="absolute inset-0 animate-in fade-in duration-300">
          <Image
            src={coverImage}
            alt="Background"
            fill
            className="object-cover"
            style={{ filter: "blur(40px)" }}
            priority
          />
          <div className="absolute inset-0 bg-background/60" />
        </div>
      )}

      {/* Fallback if no image */}
      {!coverImage && (
        <div
          className="absolute inset-0 bg-background/95 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Backdrop overlay */}
      {coverImage && (
        <div className="absolute inset-0" onClick={onClose} />
      )}

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl flex flex-col"
        style={{
          height: height,
          transform: `translateY(${currentTranslate}px)`,
          transition: isAnimating ? "transform 0.3s ease-out" : "none",
        }}
      >
        {/* Drag Handle */}
        <div
          className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4 border-b border-border shrink-0">
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-medium">{title}</h2>
          <div className="w-9" />
        </div>

        {/* Content - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
