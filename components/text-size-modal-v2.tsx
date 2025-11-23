"use client";

import { BottomSheet } from "@/components/bottom-sheet";
import { useEffect, useState } from "react";

interface TextSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSize: number;
  onSizeChange: (size: number) => void;
  coverImage?: string;
}

const TEXT_SIZES = [
  { value: 12, label: "12px" },
  { value: 14, label: "14px" },
  { value: 16, label: "16px" },
  { value: 18, label: "18px" },
  { value: 24, label: "24px" },
];

export function TextSizeModalV2({
  isOpen,
  onClose,
  currentSize,
  onSizeChange,
  coverImage,
}: TextSizeModalProps) {
  const [selectedSize, setSelectedSize] = useState(currentSize);

  // Sync with current size when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSize(currentSize);
    }
  }, [isOpen, currentSize]);

  const handleApply = () => {
    onSizeChange(selectedSize);
    onClose();
  };

  // Calculate Aa size based on selected text size (proportional preview)
  const getPreviewSize = () => {
    const minSize = 12;
    const maxSize = 24;
    const minPreview = 48;
    const maxPreview = 84;

    const ratio = (selectedSize - minSize) / (maxSize - minSize);
    return minPreview + ratio * (maxPreview - minPreview);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Customize Text"
      coverImage={coverImage}
      height="60vh"
      hideCloseButton
    >
      <div className="max-w-md mx-auto space-y-8">
        {/* Large Aa with dynamic sizing */}
        <div className="text-center">
          <h3
            className="font-bold mb-4 transition-all duration-200"
            style={{
              fontFamily: "Georgia, Times New Roman, serif",
              fontSize: `${getPreviewSize()}px`,
            }}
          >
            Aa
          </h3>
          <p className="text-sm text-muted-foreground">
            Current: {selectedSize}px
          </p>
        </div>

        {/* Slider */}
        <div className="space-y-4">
          <div className="relative px-2">
            <input
              type="range"
              min="0"
              max="4"
              step="1"
              value={TEXT_SIZES.findIndex((s) => s.value === selectedSize)}
              onChange={(e) => {
                const index = parseInt(e.target.value);
                setSelectedSize(TEXT_SIZES[index].value);
              }}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
            />
            <div className="flex justify-between mt-3">
              {TEXT_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setSelectedSize(size.value)}
                  className={`text-xs transition-colors px-2 py-1 rounded ${
                    selectedSize === size.value
                      ? "text-foreground font-semibold bg-accent"
                      : "text-foreground/50 hover:text-foreground/70"
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Text */}
        <div className="bg-muted/30 rounded-lg p-4 border border-border">
          <p
            className="transition-all duration-200"
            style={{ fontSize: `${selectedSize}px` }}
          >
            This is a preview of how your article text will look with the
            selected size.
          </p>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          className="w-full py-4 bg-foreground text-background rounded-full font-medium hover:bg-foreground/90 transition-colors"
        >
          Apply
        </button>
      </div>
    </BottomSheet>
  );
}
