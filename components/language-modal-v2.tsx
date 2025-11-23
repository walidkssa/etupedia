"use client";

import { BottomSheet } from "@/components/bottom-sheet";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  coverImage?: string;
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
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Change Language"
      coverImage={coverImage}
    >
      <div className="max-w-md mx-auto space-y-6">
        {/* Language Grid */}
        <div className="grid grid-cols-3 gap-4">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onLanguageChange(lang.code);
                onClose();
              }}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all ${
                currentLanguage === lang.code
                  ? "border-2 border-dashed border-foreground bg-accent"
                  : "border-2 border-solid border-foreground/30 bg-background hover:bg-accent/50"
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
        <button
          onClick={onClose}
          className="w-full py-4 bg-foreground text-background rounded-full font-medium hover:bg-foreground/90 transition-colors"
        >
          Apply
        </button>
      </div>
    </BottomSheet>
  );
}
