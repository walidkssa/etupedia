"use client";

import { Sun, Moon } from "lucide-react";

interface FloatingThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function FloatingThemeToggle({ isDark, onToggle }: FloatingThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="fixed top-1/2 -translate-y-1/2 right-6 z-40 p-2.5 bg-card border border-border rounded-lg shadow-lg hover:bg-accent transition-colors"
      style={{ transform: "translate(0, calc(-50% - 60px))" }}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-muted-foreground" />
      ) : (
        <Moon className="w-5 h-5 text-muted-foreground" />
      )}
    </button>
  );
}
