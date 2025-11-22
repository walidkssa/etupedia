"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface TextSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSize: number;
  onSizeChange: (size: number) => void;
}

const TEXT_SIZES = [
  { value: 12, label: "12px" },
  { value: 14, label: "14px" },
  { value: 16, label: "16px" },
  { value: 18, label: "18px" },
  { value: 24, label: "24px" },
];

export function TextSizeModal({
  isOpen,
  onClose,
  currentSize,
  onSizeChange,
}: TextSizeModalProps) {
  const [selectedSize, setSelectedSize] = useState(currentSize);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setSelectedSize(currentSize);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, currentSize]);

  const handleApply = () => {
    onSizeChange(selectedSize);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-medium">Customize Text</h2>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-md mx-auto space-y-8">
            {/* Text Size Label */}
            <div className="text-center">
              <h3 className="text-6xl font-serif mb-4">Aa</h3>
              <p className="text-sm text-muted-foreground">
                Adjust text size for comfortable reading
              </p>
            </div>

            {/* Slider */}
            <div className="space-y-4">
              <div className="relative">
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
                  className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--foreground)) 0%, hsl(var(--foreground)) ${
                      (TEXT_SIZES.findIndex((s) => s.value === selectedSize) /
                        4) *
                      100
                    }%, hsl(var(--border)) ${
                      (TEXT_SIZES.findIndex((s) => s.value === selectedSize) /
                        4) *
                      100
                    }%, hsl(var(--border)) 100%)`,
                  }}
                />
                <div className="flex justify-between mt-2">
                  {TEXT_SIZES.map((size) => (
                    <span
                      key={size.value}
                      className={`text-xs ${
                        selectedSize === size.value
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {size.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="p-6 bg-accent/30 rounded-2xl">
              <p
                className="font-serif text-foreground"
                style={{ fontSize: `${selectedSize}px`, lineHeight: 1.65 }}
              >
                The cat (Felis catus), commonly referred to as the domestic cat
                or house cat, is the only domesticated species in the family
                Felidae.
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
        </div>
      </div>
    </div>
  );
}
