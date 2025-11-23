"use client";

import { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { SearchCommand } from "@/components/search-command";
import { LanguageSelector } from "@/components/language-selector";

export default function Home() {
  const [articleCount, setArticleCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setMounted(true);

    // Check initial theme
    const root = document.documentElement;
    const isCurrentlyDark = root.classList.contains("dark") || !root.classList.contains("light");
    setIsDark(isCurrentlyDark);

    // Fetch article count
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        const data = await response.json();
        setArticleCount(data.articleCount || 0);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const root = document.documentElement;
    const newIsDark = !isDark;

    // Update state
    setIsDark(newIsDark);

    // Update DOM
    root.classList.remove("light", "dark");
    root.classList.add(newIsDark ? "dark" : "light");

    // Update localStorage
    localStorage.setItem("etupedia-theme", newIsDark ? "dark" : "light");
  };

  return (
    <div className="h-screen relative overflow-hidden bg-background transition-colors">
      {/* Stars background for dark mode - only render on client */}
      {mounted && (
        <div className="absolute inset-0 dark:opacity-100 opacity-0 transition-opacity pointer-events-none">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="star text-foreground"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className="absolute top-0 right-0 p-6 z-[100] flex gap-2">
        <LanguageSelector compact />
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-lg hover:bg-accent transition-colors cursor-pointer relative z-[100]"
          aria-label="Toggle theme"
          suppressHydrationWarning
          type="button"
          style={{ pointerEvents: "auto" }}
        >
          {mounted && (
            isDark ? (
              <MoonIcon className="w-5 h-5" />
            ) : (
              <SunIcon className="w-5 h-5" />
            )
          )}
        </button>
      </header>

      {/* Main content - centered vertically */}
      <main className="relative z-10 flex flex-col items-center justify-center h-screen px-4 sm:px-6 overflow-hidden">
        <div className="w-full max-w-2xl mx-auto space-y-8 -mt-24">
          {/* Logo and title */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight inline-flex items-baseline justify-center gap-3 sm:gap-4 flex-wrap" style={{ fontFamily: "var(--font-bristol, Bristol, Georgia, serif)" }}>
              <span>etupedia</span>
              <span className="text-xs sm:text-sm font-mono px-2.5 sm:px-3 py-1 sm:py-1.5 bg-secondary text-secondary-foreground rounded-full -translate-y-1 sm:-translate-y-2">
                v2.0
              </span>
            </h1>
          </div>

          {/* Search bar */}
          <div className="w-full">
            <SearchCommand placeholder="search an article (im not chatgpt)" />
          </div>
        </div>
      </main>

      {/* Article count at bottom */}
      <footer className="absolute bottom-4 left-0 right-0 z-10">
        <div className="text-center space-y-1">
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Articles Available
          </p>
          <p className="text-sm sm:text-base font-normal tracking-tight text-foreground" style={{ fontFamily: '-apple-system, "SF Pro Display", system-ui, sans-serif' }}>
            {articleCount.toLocaleString()}
          </p>
        </div>
      </footer>
    </div>
  );
}
