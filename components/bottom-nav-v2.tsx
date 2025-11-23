"use client";

import { Globe2, Type, Download, Share2 } from "lucide-react";

interface BottomNavProps {
  onLanguageClick: () => void;
  onTextSizeClick: () => void;
  onShareClick: () => void;
  onSaveClick: () => void;
}

export function BottomNavV2({
  onLanguageClick,
  onTextSizeClick,
  onShareClick,
  onSaveClick,
}: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {/* Language - Globe avec "Aa" en dessous */}
        <button
          onClick={onLanguageClick}
          className="flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors active:bg-accent"
          aria-label="Change language"
        >
          <Globe2 className="w-6 h-6" strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Aa</span>
        </button>

        {/* Text Size - "Aa" typographie */}
        <button
          onClick={onTextSizeClick}
          className="flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors active:bg-accent"
          aria-label="Text size"
        >
          <Type className="w-6 h-6" strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Aa</span>
        </button>

        {/* Save */}
        <button
          onClick={onSaveClick}
          className="flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors active:bg-accent"
          aria-label="Save"
        >
          <Download className="w-6 h-6" strokeWidth={1.5} />
        </button>

        {/* Share */}
        <button
          onClick={onShareClick}
          className="flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors active:bg-accent"
          aria-label="Share"
        >
          <Share2 className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
