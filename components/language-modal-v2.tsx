"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  coverImage?: string; // Image de couverture pour le blur
}

const LANGUAGES = [
  { code: "en", label: "T", name: "English" },
  { code: "zh", label: "字", name: "中文" },
  { code: "hi", label: "अ", name: "हिन्दी" },
  { code: "bn", label: "অ", name: "বাংলা" },
  { code: "ar", label: "ع", name: "العربية" },
  { code: "ko", label: "가", name: "한국어" },
  { code: "th", label: "ก", name: "ไทย" },
  { code: "ja", label: "あ", name: "日本語" },
];

export function LanguageModalV2({
  isOpen,
  onClose,
  currentLanguage,
  onLanguageChange,
  coverImage,
}: LanguageModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Background image with strong blur */}
      {coverImage && (
        <div className="absolute inset-0">
          <Image
            src={coverImage}
            alt="Background"
            fill
            className="object-cover"
            style={{ filter: 'blur(40px)' }}
            priority
          />
          <div className="absolute inset-0 bg-background/60" />
        </div>
      )}

      {/* Fallback if no image */}
      {!coverImage && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" />
      )}

      {/* Modal content */}
      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-background/20 rounded-lg transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-medium">Change Language</h2>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Language Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onLanguageChange(lang.code);
                  onClose();
                }}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all ${
                  currentLanguage === lang.code
                    ? "border-2 border-dashed border-foreground bg-background/40"
                    : "border-2 border-solid border-foreground/30 bg-background/20 hover:bg-background/30"
                }`}
              >
                <span className="text-3xl mb-2">{lang.label}</span>
                <span className="text-xs text-foreground/70">
                  {lang.name}
                </span>
              </button>
            ))}
          </div>

          {/* Apply Button */}
          <div className="max-w-md mx-auto mt-8">
            <button
              onClick={onClose}
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
