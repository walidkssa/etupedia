"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Search, Sun, Moon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface TocSection {
  id: string;
  title: string;
  level: number;
  children?: TocSection[];
}

interface MobileHeaderProps {
  sections: TocSection[];
  activeSection: string;
  isDark: boolean;
  onThemeToggle: () => void;
  onSearchClick: () => void;
}

export function MobileHeader({
  sections,
  activeSection,
  isDark,
  onThemeToggle,
  onSearchClick,
}: MobileHeaderProps) {
  const [tocOpen, setTocOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setTocOpen(false);
    }
  };

  const renderSection = (section: TocSection, depth: number = 0) => {
    const isActive = activeSection === section.id;
    const paddingLeft = depth * 16;

    return (
      <div key={section.id}>
        <button
          onClick={() => scrollToSection(section.id)}
          className={`w-full text-left py-2 px-3 rounded-lg transition-colors ${
            isActive
              ? "bg-accent text-accent-foreground font-medium"
              : "hover:bg-accent/50 text-foreground"
          }`}
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
        >
          <span className="text-sm line-clamp-2">{section.title}</span>
        </button>
        {section.children?.map((child) => renderSection(child, depth + 1))}
      </div>
    );
  };

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left: TOC Button */}
        <Sheet open={tocOpen} onOpenChange={setTocOpen}>
          <SheetTrigger asChild>
            <button
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Table of Contents"
            >
              <BookOpen className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] sm:w-[350px] p-0">
            <SheetHeader className="border-b border-border p-4">
              <SheetTitle>Table of Contents</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto h-[calc(100vh-73px)] p-4 space-y-1">
              {sections.map((section) => renderSection(section))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Center: Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <span
            className="text-5xl font-bold tracking-tight text-foreground transition-colors hover:opacity-80"
            style={{
              fontFamily: "var(--font-bristol, Bristol, Georgia, serif)",
            }}
          >
            e
          </span>
        </Link>

        {/* Right: Search + Theme Toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={onSearchClick}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={onThemeToggle}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
