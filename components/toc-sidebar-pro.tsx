"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

interface TocSection {
  id: string;
  title: string;
  level: number;
  children?: TocSection[];
}

interface TocSidebarProProps {
  sections: TocSection[];
  activeSection?: string;
}

export function TocSidebarPro({ sections, activeSection }: TocSidebarProProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map((s) => s.id))
  );

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
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
    const isExpanded = expandedSections.has(section.id);
    const isActive = activeSection === section.id;

    // Base styles for all items
    const baseStyles = "group relative flex items-start gap-2 py-1.5 px-2 rounded-md text-sm transition-all duration-200";
    const activeStyles = isActive
      ? "bg-primary/10 text-primary font-medium border-l-2 border-primary pl-[6px]"
      : "text-muted-foreground hover:text-foreground hover:bg-accent/50";

    if (!hasChildren) {
      return (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          className={`w-full ${baseStyles} ${activeStyles}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <span className="flex-1 text-left text-sm leading-snug">
            {section.title}
          </span>
          {isActive && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
          )}
        </button>
      );
    }

    return (
      <div key={section.id} className="space-y-0.5">
        <button
          onClick={() => {
            toggleSection(section.id);
            scrollToSection(section.id);
          }}
          className={`w-full ${baseStyles} ${activeStyles}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <ChevronRight
            className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-transform duration-200 ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
          <span className="flex-1 text-left text-sm font-medium leading-snug">
            {section.title}
          </span>
          {isActive && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
          )}
        </button>
        {isExpanded && section.children && (
          <div className="space-y-0.5 mt-0.5">
            {section.children.map((child) => renderSection(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="hidden lg:block sticky top-20 h-[calc(100vh-5rem)] w-64 xl:w-72 shrink-0 overflow-y-auto">
      <nav className="space-y-1 pr-4">
        <div className="mb-4 pb-2 border-b border-border/50">
          <h2 className="text-sm font-semibold text-foreground px-2">
            On this page
          </h2>
        </div>
        <div className="space-y-0.5">
          {sections.map((section) => renderSection(section))}
        </div>
      </nav>
    </aside>
  );
}
