"use client";

import { useState } from "react";
import { Globe2, Type, Share2, Bookmark } from "lucide-react";

interface BottomNavProps {
  onLanguageClick: () => void;
  onTextSizeClick: () => void;
  onShareClick: () => void;
  onBookmarkClick?: () => void;
}

export function BottomNav({
  onLanguageClick,
  onTextSizeClick,
  onShareClick,
  onBookmarkClick,
}: BottomNavProps) {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleClick = (action: () => void, buttonId: string) => {
    setActiveButton(buttonId);
    action();
    setTimeout(() => setActiveButton(null), 200);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around px-4 py-3">
        <button
          onClick={() => handleClick(onLanguageClick, "language")}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
            activeButton === "language" ? "bg-accent" : "active:bg-accent/50"
          }`}
          aria-label="Change language"
        >
          <Globe2 className="w-6 h-6" />
          <span className="text-xs">Aa</span>
        </button>

        <button
          onClick={() => handleClick(onTextSizeClick, "textsize")}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
            activeButton === "textsize" ? "bg-accent" : "active:bg-accent/50"
          }`}
          aria-label="Customize text size"
        >
          <Type className="w-6 h-6" />
          <span className="text-xs">Aa</span>
        </button>

        <button
          onClick={() => handleClick(onBookmarkClick || (() => {}), "bookmark")}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
            activeButton === "bookmark" ? "bg-accent" : "active:bg-accent/50"
          }`}
          aria-label="Bookmark article"
        >
          <Bookmark className="w-6 h-6" />
        </button>

        <button
          onClick={() => handleClick(onShareClick, "share")}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
            activeButton === "share" ? "bg-accent" : "active:bg-accent/50"
          }`}
          aria-label="Share article"
        >
          <Share2 className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
