"use client";

import { BottomSheet } from "@/components/bottom-sheet";
import { useState } from "react";

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

  const handleApply = () => {
    onSizeChange(selectedSize);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Customize Text"
      coverImage={coverImage}
    >
      <div className="max-w-md mx-auto space-y-8">
        {/* Large Aa */}
        <div className="text-center">
          <h3
            className="text-7xl font-bold mb-4"
            style={{ fontFamily: "Georgia, Times New Roman, serif" }}
          >
            Aa
          </h3>
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
              className="w-full h-1 bg-foreground/20 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between mt-3">
              {TEXT_SIZES.map((size) => (
                <span
                  key={size.value}
                  className={`text-xs transition-colors ${
                    selectedSize === size.value
                      ? "text-foreground font-semibold"
                      : "text-foreground/50"
                  }`}
                >
                  {size.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          className="w-full py-4 bg-foreground text-background rounded-full font-medium hover:bg-foreground/90 transition-colors mt-12"
        >
          Apply
        </button>
      </div>
    </BottomSheet>
  );
}
