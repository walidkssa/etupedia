"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/use-language";
import { WIKIPEDIA_LANGUAGES, getLanguageName } from "@/lib/wikipedia-languages";
import { GlobeIcon } from "@radix-ui/react-icons";

interface LanguageSelectorProps {
  compact?: boolean;
}

export function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const { currentLanguage, changeLanguage, mounted } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  if (!mounted) {
    return (
      <button className="p-2.5 rounded-lg hover:bg-accent transition-colors opacity-50" disabled>
        <GlobeIcon className="w-5 h-5" />
      </button>
    );
  }

  const filteredLanguages = WIKIPEDIA_LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageSelect = (code: string) => {
    changeLanguage(code);
    setIsOpen(false);
    setSearchQuery("");

    // Check if we're on an article page
    const articleMatch = pathname?.match(/^\/article\/([^?]+)/);

    if (articleMatch) {
      // We're on an article page - reload the same article in the new language
      const slug = articleMatch[1];
      router.push(`/article/${slug}?lang=${code}`);
      // Force reload to fetch new content
      window.location.href = `/article/${slug}?lang=${code}`;
    } else {
      // We're on homepage or other page - just reload
      window.location.reload();
    }
  };

  const currentLangName = getLanguageName(currentLanguage, true);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-accent transition-colors"
        aria-label="Select language"
        title="Select language"
      >
        <GlobeIcon className="w-5 h-5" />
        {!compact && (
          <span className="hidden sm:inline text-sm font-medium">
            {currentLangName}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 flex flex-col">
            {/* Search Input */}
            <div className="p-3 border-b border-border">
              <input
                type="text"
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>

            {/* Language List */}
            <div className="overflow-y-auto flex-1">
              {filteredLanguages.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No languages found
                </div>
              ) : (
                filteredLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`w-full px-4 py-2.5 text-left hover:bg-accent transition-colors flex items-center justify-between ${
                      currentLanguage === lang.code ? "bg-accent" : ""
                    }`}
                  >
                    <span className="flex-1">
                      <span className="font-medium">{lang.nativeName}</span>
                      {lang.nativeName !== lang.name && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({lang.name})
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase ml-2">
                      {lang.code}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-border text-xs text-muted-foreground text-center">
              {filteredLanguages.length} language{filteredLanguages.length !== 1 ? 's' : ''} available
            </div>
          </div>
        </>
      )}
    </div>
  );
}
