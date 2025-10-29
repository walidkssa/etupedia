"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "@/components/theme-provider";
import { SearchCommand } from "@/components/search-command";
import { SearchResult } from "@/lib/types";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { theme, setTheme } = useTheme();
  const resultsPerPage = 10;

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      setResults(data.results || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Pagination
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = results.slice(startIndex, endIndex);

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      if (currentPage <= 3) {
        buttons.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        buttons.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        buttons.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return buttons;
  };

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <Link
              href="/"
              className="font-space text-xl sm:text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity"
            >
              Etupedia
            </Link>

            <div className="flex-1 max-w-xl">
              <SearchCommand placeholder="Search" compact />
            </div>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg hover:bg-accent transition-colors shrink-0"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search results */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent"></div>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-10">
            {/* Results count */}
            <p className="text-sm text-muted-foreground">
              Search for "{query}" yielded {results.length.toLocaleString()} results:
            </p>

            {/* Results list */}
            <div className="space-y-1">
              {currentResults.map((result, index) => (
                <Link
                  key={index}
                  href={`/article/${encodeURIComponent(result.slug)}`}
                  className="block px-4 py-3 hover:bg-accent/50 transition-colors rounded-lg group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{result.title}</span>
                    <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="pt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {renderPaginationButtons().map((page, index) => (
                    page === "..." ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page as number)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        ) : query ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              No results found for "{query}"
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
