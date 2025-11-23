"use client";

import Link from "next/link";

export function ArticleHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-center px-4 h-20 max-w-7xl mx-auto">
        {/* Logo - Just "e" in Bristol - Centered - 2x Plus Grand */}
        <Link href="/">
          <span
            className="text-9xl font-bold tracking-tight text-foreground transition-colors hover:opacity-80"
            style={{
              fontFamily: "var(--font-bristol, Bristol, Georgia, serif)",
            }}
          >
            e
          </span>
        </Link>
      </div>
    </header>
  );
}
