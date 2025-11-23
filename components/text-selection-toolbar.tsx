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
  const isApplyingModification = useRef(false);

  const updateToolbarPosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Calculate toolbar dimensions (approximate)
    const toolbarWidth = 240; // More accurate width
    const toolbarHeight = 50; // More accurate height
    const padding = 16; // More padding for safety

    // Calculate initial position
    let x = rect.left + rect.width / 2 + window.scrollX;
    let y = rect.top + window.scrollY - toolbarHeight - 20;

    // Prevent toolbar from going off screen horizontally
    const maxX = window.innerWidth + window.scrollX - padding;
    const minX = window.scrollX + padding;

    // Constrain horizontally with better centering
    const halfToolbarWidth = toolbarWidth / 2;
    if (x + halfToolbarWidth > maxX) {
      x = maxX - halfToolbarWidth;
    }
    if (x - halfToolbarWidth < minX) {
      x = minX + halfToolbarWidth;
    }

    // If toolbar would be above viewport or too close to top, show it below
    const headerHeight = 80; // Account for fixed header
    if (y < window.scrollY + headerHeight) {
      y = rect.bottom + window.scrollY + 20;
    }

    setPosition({ x, y });
  }, []);

  useEffect(() => {
    const handleSelection = () => {
      // Don't handle selection while applying modification
      if (isApplyingModification.current) return;

      // Small delay to ensure selection is complete on mobile
      setTimeout(() => {
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
          }
        } else {
          // Only hide if we're not showing color pickers
          if (!showHighlightColors && !showTextColors) {
            setTimeout(() => {
              if (!toolbarRef.current?.matches(':hover') && !showHighlightColors && !showTextColors) {
                setIsVisible(false);
              }
            }, 100);
          }
        }
      }, 50);
    };

    // Handle both mouse and touch events
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("touchend", handleSelection);

    // Additional event for mobile selection
    document.addEventListener("selectionchange", () => {
      if (!isApplyingModification.current) {
        // Debounce selectionchange on mobile
        clearTimeout((window as any)._selectionTimeout);
        (window as any)._selectionTimeout = setTimeout(handleSelection, 100);
      }
    });

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("touchend", handleSelection);
      clearTimeout((window as any)._selectionTimeout);
    };
  }, [updateToolbarPosition, showHighlightColors, showTextColors]);

  const applyModification = useCallback((
    type: "highlight" | "underline" | "color" | "bold" | "italic",
    color?: string
  ) => {
    if (!savedSelection.current) {
      console.log("No saved selection");
      return;
    }

    const { text, range } = savedSelection.current;
    isApplyingModification.current = true;

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
          console.log("Applied highlight:", color);
          break;
        case "underline":
          span.style.textDecoration = "underline";
          span.style.textDecorationThickness = "2px";
          span.style.textUnderlineOffset = "2px";
          break;
        case "color":
          span.style.color = color || TEXT_COLORS[0];
          console.log("Applied color:", color);
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

      // Clear selection
      const selection = window.getSelection();
      selection?.removeAllRanges();

      // Hide toolbar and reset state
      setTimeout(() => {
        setIsVisible(false);
        setShowHighlightColors(false);
        setShowTextColors(false);
        savedSelection.current = null;
        savedRange.current = null;
        isApplyingModification.current = false;
      }, 100);
    } catch (error) {
      console.error("Error applying modification:", error);
      isApplyingModification.current = false;
    }
  }, [onModification]);

  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-[100] bg-card border border-border rounded-lg shadow-2xl p-1.5 md:p-1.5 flex items-center gap-1 md:gap-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, 0)",
      }}
      onMouseDown={(e) => {
        // Prevent default to keep selection
        e.preventDefault();
        e.stopPropagation();
      }}
      onTouchStart={(e) => {
        // Prevent default on mobile
        e.stopPropagation();
      }}
    >
      {/* Bold */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          applyModification("bold");
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          applyModification("bold");
        }}
        className="p-2 hover:bg-accent active:bg-accent rounded transition-colors touch-manipulation"
        title="Bold"
      >
        <Bold className="w-4.5 h-4.5 md:w-4 md:h-4" />
      </button>

      {/* Italic */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          applyModification("italic");
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          applyModification("italic");
        }}
        className="p-2 hover:bg-accent active:bg-accent rounded transition-colors touch-manipulation"
        title="Italic"
      >
        <Italic className="w-4.5 h-4.5 md:w-4 md:h-4" />
      </button>

      {/* Separator */}
      <div className="w-px h-5 bg-border mx-0.5" />

      {/* Highlight */}
      <div className="relative">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowHighlightColors(!showHighlightColors);
            setShowTextColors(false);
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowHighlightColors(!showHighlightColors);
            setShowTextColors(false);
          }}
          className={`p-2 hover:bg-accent active:bg-accent rounded transition-colors touch-manipulation ${showHighlightColors ? 'bg-accent' : ''}`}
          title="Highlight"
        >
          <Highlighter className="w-4.5 h-4.5 md:w-4 md:h-4" />
        </button>

        {showHighlightColors && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-card border border-border rounded-lg shadow-lg p-1.5 flex gap-1.5 z-[110]"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Highlight color clicked (touch):", color);
                  applyModification("highlight", color);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Highlight color clicked:", color);
                  applyModification("highlight", color);
                }}
                className="w-7 h-7 rounded border-2 border-border hover:border-foreground active:scale-95 transition-all cursor-pointer touch-manipulation"
                style={{ backgroundColor: color }}
                title={`Highlight with ${color}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Underline */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          applyModification("underline");
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          applyModification("underline");
        }}
        className="p-2 hover:bg-accent active:bg-accent rounded transition-colors touch-manipulation"
        title="Underline"
      >
        <Underline className="w-4.5 h-4.5 md:w-4 md:h-4" />
      </button>

      {/* Text Color */}
      <div className="relative">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowTextColors(!showTextColors);
            setShowHighlightColors(false);
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowTextColors(!showTextColors);
            setShowHighlightColors(false);
          }}
          className={`p-2 hover:bg-accent active:bg-accent rounded transition-colors touch-manipulation ${showTextColors ? 'bg-accent' : ''}`}
          title="Text Color"
        >
          <Type className="w-4.5 h-4.5 md:w-4 md:h-4" />
        </button>

        {showTextColors && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-card border border-border rounded-lg shadow-lg p-1.5 flex gap-1.5 z-[110]"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {TEXT_COLORS.map((color) => (
              <button
                key={color}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Text color clicked (touch):", color);
                  applyModification("color", color);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Text color clicked:", color);
                  applyModification("color", color);
                }}
                className="w-7 h-7 rounded border-2 border-border hover:border-foreground active:scale-95 transition-all cursor-pointer touch-manipulation"
                style={{ backgroundColor: color }}
                title={`Color text with ${color}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
