"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, Cross2Icon, ClockIcon } from "@radix-ui/react-icons";
import { useLanguage } from "@/hooks/use-language";

interface SearchResult {
  title: string;
  slug: string;
  source: string;
  url: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [history, setHistory] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { currentLanguage, mounted } = useLanguage();

  // Load search history
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("search-history");
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch (e) {
          console.error("Error loading search history:", e);
        }
      }
    }
  }, []);

  // Focus input when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Fetch search results
  React.useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const lang = mounted ? currentLanguage : 'en';
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&lang=${lang}`);
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query, currentLanguage, mounted]);

  const handleSelect = (result: SearchResult | string) => {
    const titleValue = typeof result === 'string' ? result : result.title;

    // Add to history
    const newHistory = [titleValue, ...history.filter(h => h !== titleValue)].slice(0, 5);
    setHistory(newHistory);
    if (typeof window !== "undefined") {
      localStorage.setItem("search-history", JSON.stringify(newHistory));
    }

    // Navigate to article
    const slug = encodeURIComponent(typeof result === 'string' ? result : result.slug);
    const lang = mounted ? currentLanguage : 'en';
    router.push(`/article/${slug}?lang=${lang}`);
    onClose();
  };

  const removeFromHistory = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h !== value);
    setHistory(newHistory);
    if (typeof window !== "undefined") {
      localStorage.setItem("search-history", JSON.stringify(newHistory));
    }
  };

  // Handle Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal - Full screen on mobile, centered on desktop */}
      <div className="fixed inset-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-full md:max-w-2xl md:h-auto md:mx-4">
        <div className="bg-card border-0 md:border md:border-border h-full md:h-auto md:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 md:px-6 py-4 md:py-5 border-b border-border shrink-0">
            <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query && results.length > 0) {
                  handleSelect(results[0]);
                }
              }}
              placeholder="Search articles..."
              className="flex-1 bg-transparent outline-none text-base md:text-lg placeholder:text-muted-foreground"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors shrink-0"
              aria-label="Close"
            >
              <Cross2Icon className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto md:max-h-[60vh]">
            {loading ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <div className="w-6 h-6 border-2 border-muted-foreground/20 border-t-foreground/50 rounded-full animate-spin mx-auto mb-3" />
                Searching...
              </div>
            ) : (
              <>
                {/* History */}
                {!query && history.length > 0 && (
                  <div className="py-2">
                    <div className="px-6 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Recent Searches
                    </div>
                    {history.map((item, index) => (
                      <button
                        key={index}
                        className="w-full flex items-center justify-between px-6 py-3 hover:bg-accent transition-colors text-left group"
                        onClick={() => handleSelect(item)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <ClockIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm truncate">{item}</span>
                        </div>
                        <button
                          onClick={(e) => removeFromHistory(item, e)}
                          className="ml-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Cross2Icon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      </button>
                    ))}
                  </div>
                )}

                {/* Search Results */}
                {query && results.length > 0 && (
                  <div className="py-2">
                    <div className="px-6 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Results ({results.length})
                    </div>
                    {results.slice(0, 10).map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelect(result)}
                        className="w-full flex items-center gap-3 px-6 py-3 hover:bg-accent transition-colors text-left"
                      >
                        <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate flex-1">{result.title}</span>
                        <svg
                          className="w-4 h-4 text-muted-foreground shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {query && !loading && results.length === 0 && (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    <p className="mb-2">No results found for "{query}"</p>
                    <p className="text-xs">Try different keywords</p>
                  </div>
                )}

                {/* Empty State */}
                {!query && history.length === 0 && (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    <MagnifyingGlassIcon className="h-8 w-8 mx-auto mb-3 opacity-50" />
                    <p>Start typing to search articles</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Hint */}
          <div className="px-4 md:px-6 py-3 border-t border-border bg-muted/30 shrink-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="hidden sm:inline">Press Enter to navigate</span>
              <span className="sm:hidden">Tap to navigate</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
