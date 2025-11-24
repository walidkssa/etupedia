"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Search, Download, BookOpen } from "lucide-react";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface TocSection {
  id: string;
  title: string;
  level: number;
  children?: TocSection[];
}

interface FloatingActionButtonsProps {
  // TOC props
  sections: TocSection[];
  activeSection?: string;

  // Theme props
  isDark: boolean;
  onThemeToggle: () => void;

  // Search props
  onSearchClick: () => void;

  // PDF props
  onPdfDownload: () => void;
  onPdfDownloadDirect?: () => void; // Direct download for desktop
}

export function FloatingActionButtons({
  sections,
  activeSection,
  isDark,
  onThemeToggle,
  onSearchClick,
  onPdfDownload,
  onPdfDownloadDirect,
}: FloatingActionButtonsProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(sections.map((s) => s.id))
  );
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect if desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handlePdfClick = () => {
    if (isDesktop && onPdfDownloadDirect) {
      onPdfDownloadDirect(); // Direct download on desktop
    } else {
      onPdfDownload(); // Open modal on mobile
    }
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const renderSection = (section: TocSection, depth: number = 0) => {
    const hasChildren = section.children && section.children.length > 0;
    const isOpenSection = openSections.has(section.id);
    const isActive = activeSection === section.id;

    if (!hasChildren) {
      return (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-md text-sm transition-colors ${
            isActive
              ? "bg-blue-500/20 text-blue-400"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <span className="flex-1 text-left truncate text-xs">{section.title}</span>
        </button>
      );
    }

    return (
      <Collapsible
        key={section.id}
        open={isOpenSection}
        onOpenChange={() => toggleSection(section.id)}
      >
        <CollapsibleTrigger asChild>
          <button
            className={`w-full flex items-center gap-1.5 py-1.5 px-2 rounded-md text-sm transition-colors ${
              isActive
                ? "bg-blue-500/20 text-blue-400"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            <ChevronRight
              className={`w-3 h-3 shrink-0 transition-transform ${
                isOpenSection ? "rotate-90" : ""
              }`}
            />
            <span className="flex-1 text-left truncate font-medium text-xs">
              {section.title}
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5 mt-0.5">
          {section.children?.map((child) => renderSection(child, depth + 1))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-3">
      {/* PDF Download Button */}
      <button
        onClick={handlePdfClick}
        className="p-2.5 bg-card border border-border rounded-lg shadow-lg hover:bg-accent transition-colors"
        aria-label="Download PDF"
      >
        <Download className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Table of Contents */}
      <HoverCard open={isTocOpen} onOpenChange={setIsTocOpen} openDelay={200} closeDelay={200}>
        <HoverCardTrigger asChild>
          <button
            className="p-2.5 bg-card border border-border rounded-lg shadow-lg hover:bg-accent transition-colors"
            onMouseEnter={() => setIsTocOpen(true)}
            aria-label="Table of Contents"
          >
            <BookOpen className="w-5 h-5 text-muted-foreground" />
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          side="left"
          align="center"
          sideOffset={12}
          className="w-56 max-h-[calc(100vh-200px)] overflow-y-auto p-2.5 bg-card/95 backdrop-blur-sm border border-border shadow-2xl"
          onMouseEnter={() => setIsTocOpen(true)}
          onMouseLeave={() => setIsTocOpen(false)}
        >
          <nav className="space-y-0.5">
            <div className="mb-3 px-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Table of Contents
              </h3>
            </div>
            {sections.map((section) => renderSection(section))}
          </nav>
        </HoverCardContent>
      </HoverCard>

      {/* Search Button */}
      <button
        onClick={onSearchClick}
        className="p-2.5 bg-card border border-border rounded-lg shadow-lg hover:bg-accent transition-colors"
        aria-label="Search"
      >
        <Search className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Theme Toggle */}
      <button
        onClick={onThemeToggle}
        className="p-2.5 bg-card border border-border rounded-lg shadow-lg hover:bg-accent transition-colors"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-muted-foreground" />
        ) : (
          <Moon className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}
