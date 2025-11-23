"use client";

import { useState } from "react";
import { ChevronRight, BookOpen } from "lucide-react";
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

interface FloatingTocNotionProps {
  sections: TocSection[];
  activeSection?: string;
}

export function FloatingTocNotion({ sections, activeSection }: FloatingTocNotionProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(sections.map((s) => s.id))
  );
  const [isOpen, setIsOpen] = useState(false);

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
    <HoverCard open={isOpen} onOpenChange={setIsOpen} openDelay={200} closeDelay={200}>
      <HoverCardTrigger asChild>
        <button
          className="fixed top-24 right-6 z-40 p-2.5 bg-card border border-border rounded-lg shadow-lg hover:bg-accent transition-colors"
          onMouseEnter={() => setIsOpen(true)}
        >
          <BookOpen className="w-5 h-5 text-muted-foreground" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="left"
        align="start"
        sideOffset={12}
        className="w-72 max-h-[calc(100vh-120px)] overflow-y-auto p-3 bg-card/95 backdrop-blur-sm border border-border shadow-2xl"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
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
  );
}
