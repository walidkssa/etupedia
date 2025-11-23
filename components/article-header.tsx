"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export function ArticleHeader() {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto">
        {/* Left spacing for balance on desktop */}
        <div className="w-10 md:w-12" />

        {/* Logo - Just "e" in Bristol - Centered */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <span
            className="text-5xl font-bold tracking-tight text-foreground transition-colors"
            style={{
              fontFamily: "var(--font-bristol, Bristol, Georgia, serif)",
            }}
          >
            e
          </span>
        </Link>

        {/* Search Button - Right Side */}
        <button
          onClick={() => router.push("/search")}
          className="p-2.5 md:p-2 bg-card border border-border rounded-lg shadow-sm hover:bg-accent transition-colors active:scale-95"
          aria-label="Search"
        >
          <Search className="w-5 h-5 md:w-4.5 md:h-4.5 text-muted-foreground" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
