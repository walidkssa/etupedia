"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
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

export function LanguageModal({
  isOpen,
  onClose,
  currentLanguage,
  onLanguageChange,
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
          <h2 className="text-lg font-medium">Change Language</h2>
          <div className="w-9" /> {/* Spacer for centering */}
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
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                  currentLanguage === lang.code
                    ? "border-foreground bg-accent"
                    : "border-border hover:border-foreground/50 hover:bg-accent/50"
                }`}
              >
                <span className="text-3xl mb-2">{lang.label}</span>
                <span className="text-xs text-muted-foreground">
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
