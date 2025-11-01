"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, ClockIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useLanguage } from "@/hooks/use-language";

interface SearchResult {
  title: string;
  slug: string;
  source: string;
  url: string;
}

interface SearchCommandProps {
  placeholder?: string;
  compact?: boolean;
  hidePlaceholderOnMobile?: boolean;
}

export function SearchCommand({ placeholder, compact = false, hidePlaceholderOnMobile = false }: SearchCommandProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [history, setHistory] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { currentLanguage, mounted } = useLanguage();

  // Load search history from localStorage
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

    setOpen(false);
    setQuery("");

    // Navigate to article with language parameter
    const slug = encodeURIComponent(typeof result === 'string' ? result : result.slug);
    const lang = mounted ? currentLanguage : 'en';
    router.push(`/article/${slug}?lang=${lang}`);
  };

  const removeFromHistory = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h !== value);
    setHistory(newHistory);
    if (typeof window !== "undefined") {
      localStorage.setItem("search-history", JSON.stringify(newHistory));
    }
  };

  // Handle ⌘K shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-search-command]")) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = open && (query || history.length > 0);

  return (
    <div className="relative w-full" data-search-command>
      {/* Search Input */}
      <div className={`relative flex items-center bg-input border border-border rounded-xl overflow-hidden transition-all ${
        showDropdown ? "rounded-b-none" : ""
      }`}>
        <div className="pl-4 pr-2">
          <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query) {
              // Add to history
              const newHistory = [query, ...history.filter(h => h !== query)].slice(0, 5);
              setHistory(newHistory);
              if (typeof window !== "undefined") {
                localStorage.setItem("search-history", JSON.stringify(newHistory));
              }
              // Go to search results page
              router.push(`/search?q=${encodeURIComponent(query)}`);
              setOpen(false);
            }
          }}
          placeholder={placeholder || "Search"}
          className={`flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground ${
            hidePlaceholderOnMobile ? "placeholder:opacity-0 sm:placeholder:opacity-100" : ""
          } ${compact ? "h-9 py-2" : "h-12 py-3"}`}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          data-1p-ignore
          data-lpignore="true"
          data-form-type="other"
          name="search-query"
          aria-label="Search"
          style={{
            WebkitAppearance: 'none',
            MozAppearance: 'none',
          }}
        />
        {showDropdown && (
          <button
            onClick={() => {
              setOpen(false);
              setQuery("");
            }}
            className="p-2 pr-3 hover:bg-accent/50 rounded transition-colors"
            type="button"
          >
            <svg
              className="w-4 h-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
        {!query && (
          <div className="pr-3">
            <kbd className="hidden sm:inline-flex h-7 select-none items-center gap-1.5 rounded-lg border bg-muted px-2.5 font-mono text-xs font-medium text-muted-foreground opacity-100">
              <span className="text-sm">⌘</span>K
            </kbd>
          </div>
        )}
        {query && (
          <button
            onClick={() => {
              // Add to history
              const newHistory = [query, ...history.filter(h => h !== query)].slice(0, 5);
              setHistory(newHistory);
              if (typeof window !== "undefined") {
                localStorage.setItem("search-history", JSON.stringify(newHistory));
              }
              // Go to search results page
              router.push(`/search?q=${encodeURIComponent(query)}`);
              setOpen(false);
            }}
            className="mr-2 p-2 hover:bg-accent/50 rounded-lg transition-colors"
            type="button"
          >
            <svg
              className="w-5 h-5 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 bg-popover border border-t-0 border-border rounded-b-xl shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : (
            <>
              {/* History */}
              {!query && history.length > 0 && (
                <div className="py-2">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-accent/50 transition-colors group cursor-pointer"
                      onClick={() => handleSelect(item)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <ClockIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate">{item}</span>
                      </div>
                      <span
                        onClick={(e) => removeFromHistory(item, e)}
                        className="ml-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                      >
                        <Cross2Icon className="h-3 w-3" />
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Results */}
              {query && results.length > 0 && (
                <div className="py-2">
                  {results.slice(0, 20).map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelect(result)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-accent/50 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate">{result.title}</span>
                      </div>
                      <svg
                        className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
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
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No results found
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
