"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Highlighter,
  Underline,
  Type,
  Bold,
  Italic,
} from "lucide-react";

interface TextModification {
  id: string;
  text: string;
  type: "highlight" | "underline" | "color" | "bold" | "italic";
  color?: string;
  range: { start: number; end: number };
}

interface TextSelectionToolbarProps {
  onModification: (modification: TextModification) => void;
}

const HIGHLIGHT_COLORS = [
  "#FEF3C7", // yellow
  "#DBEAFE", // blue
  "#D1FAE5", // green
  "#FCE7F3", // pink
  "#E0E7FF", // indigo
];

const TEXT_COLORS = [
  "#EF4444", // red
  "#3B82F6", // blue
  "#10B981", // green
  "#8B5CF6", // purple
  "#F59E0B", // orange
];

export function TextSelectionToolbar({
  onModification,
}: TextSelectionToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showHighlightColors, setShowHighlightColors] = useState(false);
  const [showTextColors, setShowTextColors] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const savedSelection = useRef<{ text: string; range: Range } | null>(null);

  const updateToolbarPosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Use window.pageYOffset to account for scroll position
    setPosition({
      x: rect.left + rect.width / 2 + window.pageXOffset,
      y: rect.top + window.pageYOffset - 10,
    });
  }, []);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0 && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // Check if selection is within article body
        const articleBody = document.querySelector('.article-body');
        if (articleBody && articleBody.contains(range.commonAncestorContainer)) {
          // Save the selection
          savedRange.current = range.cloneRange();
          savedSelection.current = {
            text,
            range: range.cloneRange(),
          };

          updateToolbarPosition();
          setIsVisible(true);
          setShowHighlightColors(false);
          setShowTextColors(false);
        }
      } else {
        // Delay hiding to allow button clicks
        setTimeout(() => {
          if (!toolbarRef.current?.matches(':hover')) {
            setIsVisible(false);
            setShowHighlightColors(false);
            setShowTextColors(false);
          }
        }, 100);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        const selection = window.getSelection();
        if (!selection || selection.toString().trim().length === 0) {
          setIsVisible(false);
          setShowHighlightColors(false);
          setShowTextColors(false);
        }
      }
    };

    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("touchend", handleSelection);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("touchend", handleSelection);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [updateToolbarPosition]);

  const applyModification = useCallback((
    type: "highlight" | "underline" | "color" | "bold" | "italic",
    color?: string
  ) => {
    if (!savedSelection.current) return;

    const { text, range } = savedSelection.current;

    try {
      // Create a span element with the styling
      const span = document.createElement("span");
      span.textContent = text;
      span.setAttribute("data-modification", type);
      span.setAttribute("data-modification-id", Date.now().toString());

      // Apply styles based on type
      switch (type) {
        case "highlight":
          span.style.backgroundColor = color || HIGHLIGHT_COLORS[0];
          span.style.padding = "2px 4px";
          span.style.borderRadius = "3px";
          break;
        case "underline":
          span.style.textDecoration = "underline";
          span.style.textDecorationThickness = "2px";
          span.style.textUnderlineOffset = "2px";
          break;
        case "color":
          span.style.color = color || TEXT_COLORS[0];
          break;
        case "bold":
          span.style.fontWeight = "bold";
          break;
        case "italic":
          span.style.fontStyle = "italic";
          break;
      }

      // Replace the selected text with the styled span
      range.deleteContents();
      range.insertNode(span);

      // Create modification object for PDF export
      const modification: TextModification = {
        id: span.getAttribute("data-modification-id") || Date.now().toString(),
        text,
        type,
        color,
        range: {
          start: 0,
          end: text.length,
        },
      };

      onModification(modification);

      // Clear selection and hide toolbar
      const selection = window.getSelection();
      selection?.removeAllRanges();

      setIsVisible(false);
      setShowHighlightColors(false);
      setShowTextColors(false);
      savedSelection.current = null;
      savedRange.current = null;
    } catch (error) {
      console.error("Error applying modification:", error);
    }
  }, [onModification]);

  if (!isVisible) return null;

  return (
    <>
      <div
        ref={toolbarRef}
        className="fixed z-50 bg-card border border-border rounded-lg shadow-2xl p-1.5 flex items-center gap-1"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translate(-50%, -100%)",
        }}
        onMouseDown={(e) => {
          // Prevent toolbar from stealing focus and clearing selection
          e.preventDefault();
        }}
      >
        {/* Bold */}
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyModification("bold")}
          className="p-2 hover:bg-accent rounded transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        {/* Italic */}
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyModification("italic")}
          className="p-2 hover:bg-accent rounded transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Highlight */}
        <div className="relative">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              setShowHighlightColors(!showHighlightColors);
              setShowTextColors(false);
            }}
            className="p-2 hover:bg-accent rounded transition-colors"
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          {showHighlightColors && (
            <div
              className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-lg p-2 flex gap-1.5 z-50"
              onMouseDown={(e) => e.preventDefault()}
            >
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    applyModification("highlight", color);
                  }}
                  className="w-6 h-6 rounded border-2 border-border hover:border-foreground transition-colors"
                  style={{ backgroundColor: color }}
                  title={`Highlight with ${color}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Underline */}
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyModification("underline")}
          className="p-2 hover:bg-accent rounded transition-colors"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>

        {/* Text Color */}
        <div className="relative">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              setShowTextColors(!showTextColors);
              setShowHighlightColors(false);
            }}
            className="p-2 hover:bg-accent rounded transition-colors"
            title="Text Color"
          >
            <Type className="w-4 h-4" />
          </button>

          {showTextColors && (
            <div
              className="absolute top-full right-0 mt-2 bg-card border border-border rounded-lg shadow-lg p-2 flex gap-1.5 z-50"
              onMouseDown={(e) => e.preventDefault()}
            >
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    applyModification("color", color);
                  }}
                  className="w-6 h-6 rounded border-2 border-border hover:border-foreground transition-colors"
                  style={{ backgroundColor: color }}
                  title={`Color text with ${color}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
