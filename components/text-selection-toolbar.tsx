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
  const savedSelection = useRef<{ text: string; range: Range } | null>(null);
  const isApplyingModification = useRef(false);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to check if a node is within article body
  const isNodeInArticleBody = useCallback((node: Node | null): boolean => {
    if (!node) return false;

    const articleBody = document.querySelector('.article-body');
    if (!articleBody) return false;

    // Get the element node (convert text nodes to their parent)
    let element: Element | null = null;
    if (node.nodeType === Node.TEXT_NODE) {
      element = node.parentElement;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      element = node as Element;
    }

    if (!element) return false;

    // Check if element is within or is the article body
    return element === articleBody || articleBody.contains(element);
  }, []);

  const updateToolbarPosition = useCallback(() => {
    if (!savedSelection.current) return;

    try {
      const range = savedSelection.current.range;
      const rect = range.getBoundingClientRect();

      // Calculate toolbar dimensions
      const toolbarWidth = 250;
      const toolbarHeight = 50;
      const padding = 20;

      // Calculate initial position (centered above selection)
      let x = rect.left + rect.width / 2 + window.scrollX;
      let y = rect.top + window.scrollY - toolbarHeight - 10;

      // Prevent toolbar from going off screen horizontally
      const halfToolbarWidth = toolbarWidth / 2;
      const minX = window.scrollX + padding;
      const maxX = window.innerWidth + window.scrollX - padding;

      if (x - halfToolbarWidth < minX) {
        x = minX + halfToolbarWidth;
      } else if (x + halfToolbarWidth > maxX) {
        x = maxX - halfToolbarWidth;
      }

      // If toolbar would be above viewport, show it below selection
      const headerHeight = 80;
      if (y < window.scrollY + headerHeight) {
        y = rect.bottom + window.scrollY + 10;
      }

      setPosition({ x, y });
    } catch (error) {
      console.error("Error updating toolbar position:", error);
    }
  }, []);

  const handleSelection = useCallback(() => {
    // Don't handle selection while applying modification
    if (isApplyingModification.current) return;

    // Clear any existing timeout
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    selectionTimeoutRef.current = setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      // Check if we have valid text selection
      if (!text || text.length === 0 || !selection || selection.rangeCount === 0) {
        // Only hide if we're not showing color pickers
        if (!showHighlightColors && !showTextColors) {
          // Small delay to allow clicking toolbar
          setTimeout(() => {
            if (!toolbarRef.current?.matches(':hover') &&
                !showHighlightColors &&
                !showTextColors) {
              setIsVisible(false);
              savedSelection.current = null;
            }
          }, 150);
        }
        return;
      }

      try {
        const range = selection.getRangeAt(0);

        // Validate that selection is within article body
        const startNode = range.startContainer;
        const endNode = range.endContainer;
        const commonAncestor = range.commonAncestorContainer;

        // Check all three: start, end, and common ancestor
        const isStartValid = isNodeInArticleBody(startNode);
        const isEndValid = isNodeInArticleBody(endNode);
        const isCommonValid = isNodeInArticleBody(commonAncestor);

        if (!isStartValid || !isEndValid || !isCommonValid) {
          // Selection is outside article body
          setIsVisible(false);
          savedSelection.current = null;
          return;
        }

        // Save the selection
        savedSelection.current = {
          text,
          range: range.cloneRange(),
        };

        // Update position and show toolbar
        updateToolbarPosition();
        setIsVisible(true);
      } catch (error) {
        console.error("Error handling selection:", error);
        setIsVisible(false);
        savedSelection.current = null;
      }
    }, 50);
  }, [isNodeInArticleBody, updateToolbarPosition, showHighlightColors, showTextColors]);

  // Setup event listeners
  useEffect(() => {
    // Handle mouseup and touchend for desktop and mobile
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("touchend", handleSelection);

    // Handle selectionchange for better mobile support
    const handleSelectionChange = () => {
      if (!isApplyingModification.current) {
        handleSelection();
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("touchend", handleSelection);
      document.removeEventListener("selectionchange", handleSelectionChange);

      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, [handleSelection]);

  // Update position on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isVisible && savedSelection.current) {
        updateToolbarPosition();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isVisible, updateToolbarPosition]);

  const applyModification = useCallback((
    type: "highlight" | "underline" | "color" | "bold" | "italic",
    color?: string
  ) => {
    if (!savedSelection.current) {
      console.warn("No saved selection available");
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

      // Clear selection
      const selection = window.getSelection();
      selection?.removeAllRanges();

      // Reset state
      setIsVisible(false);
      setShowHighlightColors(false);
      setShowTextColors(false);
      savedSelection.current = null;

      // Small delay before allowing new selections
      setTimeout(() => {
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
      className="fixed z-[100] bg-card border border-border rounded-lg shadow-2xl p-1.5 flex items-center gap-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, 0)",
        pointerEvents: "auto",
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
      }}
    >
      {/* Bold */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          applyModification("bold");
        }}
        className="p-2 hover:bg-accent active:bg-accent rounded transition-colors"
        title="Bold"
        type="button"
      >
        <Bold className="w-4 h-4" />
      </button>

      {/* Italic */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          applyModification("italic");
        }}
        className="p-2 hover:bg-accent active:bg-accent rounded transition-colors"
        title="Italic"
        type="button"
      >
        <Italic className="w-4 h-4" />
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowHighlightColors(!showHighlightColors);
            setShowTextColors(false);
          }}
          className={`p-2 hover:bg-accent active:bg-accent rounded transition-colors ${showHighlightColors ? 'bg-accent' : ''}`}
          title="Highlight"
          type="button"
        >
          <Highlighter className="w-4 h-4" />
        </button>

        {showHighlightColors && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-card border border-border rounded-lg shadow-lg p-1.5 flex gap-1.5 z-[110]"
            onMouseDown={(e) => {
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  applyModification("highlight", color);
                }}
                className="w-7 h-7 rounded border-2 border-border hover:border-foreground active:scale-95 transition-all cursor-pointer"
                style={{ backgroundColor: color }}
                title={`Highlight with ${color}`}
                type="button"
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
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          applyModification("underline");
        }}
        className="p-2 hover:bg-accent active:bg-accent rounded transition-colors"
        title="Underline"
        type="button"
      >
        <Underline className="w-4 h-4" />
      </button>

      {/* Text Color */}
      <div className="relative">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowTextColors(!showTextColors);
            setShowHighlightColors(false);
          }}
          className={`p-2 hover:bg-accent active:bg-accent rounded transition-colors ${showTextColors ? 'bg-accent' : ''}`}
          title="Text Color"
          type="button"
        >
          <Type className="w-4 h-4" />
        </button>

        {showTextColors && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-card border border-border rounded-lg shadow-lg p-1.5 flex gap-1.5 z-[110]"
            onMouseDown={(e) => {
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  applyModification("color", color);
                }}
                className="w-7 h-7 rounded border-2 border-border hover:border-foreground active:scale-95 transition-all cursor-pointer"
                style={{ backgroundColor: color }}
                title={`Color text with ${color}`}
                type="button"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
