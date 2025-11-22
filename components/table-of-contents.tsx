"use client";

import { Section } from "@/lib/types";

interface TableOfContentsProps {
  sections: Section[];
  activeSection?: string;
  onSectionClick: (sectionId: string) => void;
}

export function TableOfContents({
  sections,
  activeSection,
  onSectionClick,
}: TableOfContentsProps) {
  const renderSection = (section: Section, level: number = 0) => {
    const isActive = activeSection === section.id;

    return (
      <div key={section.id}>
        <button
          onClick={() => onSectionClick(section.id)}
          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
            level === 0 ? "font-medium" : ""
          } ${
            isActive
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          }`}
          style={{ paddingLeft: `${level * 12 + 12}px` }}
        >
          {section.title}
        </button>
        {section.subsections &&
          section.subsections.map((sub) => renderSection(sub, level + 1))}
      </div>
    );
  };

  return (
    <nav className="space-y-1">
      <h2 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Contents
      </h2>
      {sections.map((section) => renderSection(section))}
    </nav>
  );
}
