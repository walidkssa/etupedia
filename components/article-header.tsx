"use client";

import { ChevronLeft, Menu, Sun, Moon } from "lucide-react";
import Link from "next/link";

interface ArticleHeaderProps {
  onMenuClick?: () => void;
  onThemeToggle?: () => void;
  isDark?: boolean;
}

export function ArticleHeader({
  onMenuClick,
  onThemeToggle,
  isDark = false,
}: ArticleHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Back Button */}
        <Link
          href="/"
          className="p-2 hover:bg-accent rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>

        {/* Logo */}
        <Link href="/" className="flex-1 flex justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            className="text-foreground"
          >
            <path
              d="M8 4L4 28H10L12 18H20L22 28H28L24 4H18L16 14H12L14 4H8Z"
              fill="currentColor"
            />
          </svg>
        </Link>

        {/* Menu/Theme Button */}
        <div className="flex items-center gap-1">
          {onThemeToggle && (
            <button
              onClick={onThemeToggle}
              className="p-2 hover:bg-accent rounded-lg transition-colors md:flex hidden"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          )}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
