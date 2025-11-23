"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface TocSection {
  id: string;
  title: string;
  level: number;
  children?: TocSection[];
}

interface ArticleTocNotionProps {
  sections: TocSection[];
  activeSection?: string;
}

export function ArticleTocNotion({ sections, activeSection }: ArticleTocNotionProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(sections.map(s => s.id)));

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
    const isOpen = openSections.has(section.id);
    const isActive = activeSection === section.id;

    if (!hasChildren) {
      // Leaf node - simple link
      return (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          className={`w-full flex items-center gap-2 py-1.5 px-3 rounded-md text-sm transition-colors ${
            isActive
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          }`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
        >
          <span className="flex-1 text-left truncate">{section.title}</span>
        </button>
      );
    }

    // Parent node - collapsible
    return (
      <Collapsible
        key={section.id}
        open={isOpen}
        onOpenChange={() => toggleSection(section.id)}
      >
        <CollapsibleTrigger asChild>
          <button
            className={`w-full flex items-center gap-2 py-1.5 px-3 rounded-md text-sm transition-colors ${
              isActive
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
            style={{ paddingLeft: `${depth * 20 + 12}px` }}
          >
            <ChevronRight
              className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                isOpen ? "rotate-90" : ""
              }`}
            />
            <span className="flex-1 text-left truncate font-medium">{section.title}</span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5 mt-0.5">
          {section.children?.map((child) => renderSection(child, depth + 1))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <nav className="w-full bg-card border border-border rounded-xl p-3 space-y-0.5">
      {sections.map((section) => renderSection(section))}
    </nav>
  );
}
