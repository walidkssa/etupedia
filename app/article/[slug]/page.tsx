"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MoonIcon, SunIcon, CheckCircledIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { useTheme } from "@/components/theme-provider";
import { ArticleWithTOC, Section } from "@/lib/types";
import { SearchCommand } from "@/components/search-command";
import { ArticleContent } from "@/components/article-content";
import { ArticleHead } from "@/components/article-head";
import { LanguageSelector } from "@/components/language-selector";
import { ArticleAssistant } from "@/components/article-assistant-simple";
import { useLanguage } from "@/hooks/use-language";

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const searchParams = useSearchParams();
  const { currentLanguage, mounted } = useLanguage();
  const [article, setArticle] = useState<ArticleWithTOC | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (slug && mounted) {
      const lang = searchParams.get('lang') || currentLanguage;

      // Update URL with language parameter if not present for proper sharing
      if (!searchParams.get('lang') && lang !== 'en') {
        const newUrl = `/article/${slug}?lang=${lang}`;
        window.history.replaceState({}, '', newUrl);
      }

      fetchArticle(slug, lang);
    }
  }, [slug, searchParams, currentLanguage, mounted]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("[data-section-id]");
      let current = "";

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        if (window.scrollY >= sectionTop - 200) {
          current = section.getAttribute("data-section-id") || "";
        }
      });

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [article]);

  // Initialize sidebar state based on screen size
  useEffect(() => {
    // Open sidebar by default on desktop, closed on mobile
    const isDesktop = window.innerWidth >= 1024;
    setSidebarOpen(isDesktop);
  }, []);

  // Prevent body scroll when sidebar is open on mobile only
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (sidebarOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  const fetchArticle = async (articleSlug: string, language: string = 'en') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/article/${encodeURIComponent(articleSlug)}?lang=${language}`);
      const data = await response.json();
      setArticle(data);
    } catch (error) {
      console.error("Article fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    // Close mobile sidebar
    setSidebarOpen(false);

    // Update URL hash while preserving language parameter
    const currentLang = searchParams.get('lang');
    const langParam = currentLang ? `?lang=${currentLang}` : '';
    const newUrl = `/article/${slug}${langParam}#${sectionId}`;
    window.history.pushState(null, "", newUrl);

    // Scroll to element
    const element = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (element) {
      const yOffset = -120;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSummarize = async () => {
    if (!article) return;

    // If summary already exists, just toggle display
    if (summary) {
      setShowSummary(!showSummary);
      return;
    }

    setSummarizing(true);
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: article.content }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("Summarization error:", data.error);
        alert("Failed to generate summary. Please try again.");
        return;
      }

      setSummary(data.summary);
      setShowSummary(true);
    } catch (error) {
      console.error("Summarization error:", error);
      alert("Failed to generate summary. Please try again.");
    } finally {
      setSummarizing(false);
    }
  };

  const renderTableOfContents = (sections: Section[], level = 0) => {
    return (
      <ul className={level > 0 ? "ml-4 mt-1.5 space-y-1.5" : "space-y-1.5"}>
        {sections.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => scrollToSection(section.id)}
              className={`text-left w-full px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeSection === section.id
                  ? "bg-accent font-medium text-foreground"
                  : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {section.title}
            </button>
            {section.subsections && section.subsections.length > 0 && (
              renderTableOfContents(section.subsections, level + 1)
            )}
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Article not found</p>
          <Link href="/" className="text-primary hover:underline inline-block">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  // Generate description from first paragraph of content
  const getDescription = () => {
    if (!article) return "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(article.content, "text/html");
    const firstParagraph = doc.querySelector("p");
    const text = firstParagraph?.textContent || article.title;
    return text.slice(0, 160) + (text.length > 160 ? "..." : "");
  };

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Article SEO Meta Tags */}
      {article && (
        <ArticleHead
          title={article.title}
          description={getDescription()}
          slug={slug}
          url={article.url}
          language={searchParams.get('lang') || currentLanguage}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-2 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between gap-1 lg:gap-4">
            {/* Mobile layout: Hamburger + Search bar grouped */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2 rounded-lg transition-all shrink-0 ${
                  sidebarOpen
                    ? 'bg-accent hover:bg-accent/80'
                    : 'hover:bg-accent border-2 border-border'
                }`}
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                title={sidebarOpen ? "Close table of contents" : "Open table of contents"}
              >
                <HamburgerMenuIcon className="w-4 h-4" />
              </button>
              <div className="w-[120px] sm:w-[160px]">
                <SearchCommand placeholder="Search" compact />
              </div>
            </div>

            {/* Desktop layout: Hamburger + Logo grouped, Search separate */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2.5 rounded-lg transition-all shrink-0 ${
                  sidebarOpen
                    ? 'bg-accent hover:bg-accent/80'
                    : 'hover:bg-accent border-2 border-border'
                }`}
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                title={sidebarOpen ? "Close table of contents" : "Open table of contents"}
              >
                <HamburgerMenuIcon className="w-5 h-5" />
              </button>
              <Link
                href="/"
                className="font-space text-xl sm:text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity"
              >
                Etupedia
              </Link>
            </div>

            <div className="hidden lg:block flex-1 lg:max-w-xl">
              <SearchCommand placeholder="Search" compact />
            </div>

            <div className="flex items-center gap-1 lg:gap-2 shrink-0">
              {/* Assistant button - Desktop only */}
              <button
                onClick={() => article && setAssistantOpen(true)}
                disabled={!article}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black dark:bg-transparent text-white hover:bg-gray-800 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm min-w-[130px] justify-center"
                style={{
                  border: theme === 'dark' ? '2px solid white' : '2px solid transparent'
                }}
                aria-label="Open AI Assistant"
                title="Chat with AI about this article"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="whitespace-nowrap">Assistant</span>
              </button>

              {/* Language selector */}
              <LanguageSelector compact />

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 lg:p-2.5 rounded-lg hover:bg-accent transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <SunIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                ) : (
                  <MoonIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Blur overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content with sidebar */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-12">
          {/* Sidebar - Table of Contents */}
          {/* Desktop sidebar - toggleable */}
          <aside className={`hidden lg:block w-64 shrink-0 transition-all duration-300 ${
            sidebarOpen ? 'lg:w-64' : 'lg:w-0 lg:opacity-0 lg:pointer-events-none'
          }`}>
            <div className={`sticky top-24 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto pb-8 ${
              sidebarOpen ? '' : 'lg:hidden'
            }`}>
              {/* Article title in sidebar */}
              <div className="space-y-1">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="text-left w-full font-space font-semibold text-sm hover:opacity-80 transition-opacity"
                >
                  {article.title}
                </button>
              </div>

              {/* TOC sections */}
              {article.sections && article.sections.length > 0 && (
                <nav className="text-sm">
                  {renderTableOfContents(article.sections)}
                </nav>
              )}

              {/* Reference sections in TOC */}
              {article.referenceSections && article.referenceSections.length > 0 && (
                <nav className="text-sm mt-4 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      const element = document.getElementById('references');
                      if (element) {
                        const yOffset = -120;
                        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({ top: y, behavior: "smooth" });
                      }
                    }}
                    className="text-left w-full px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                  >
                    References
                  </button>
                </nav>
              )}
            </div>
          </aside>

          {/* Mobile sidebar */}
          <aside
            className={`fixed top-0 left-0 bottom-0 w-80 bg-background border-r border-border z-50 lg:hidden transition-transform duration-300 ease-in-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="h-full overflow-y-auto">
              {/* Mobile sidebar header */}
              <div className="sticky top-0 bg-background p-6 flex items-center justify-between">
                <Link
                  href="/"
                  className="font-space text-xl sm:text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity"
                >
                  Etupedia
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                  aria-label="Close menu"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                  >
                    <path
                      d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Mobile sidebar content */}
              <div className="px-6 pb-6 space-y-4">
                {/* Article title in sidebar */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setSidebarOpen(false);
                    }}
                    className="text-left w-full font-space font-semibold text-sm hover:opacity-80 transition-opacity"
                  >
                    {article.title}
                  </button>
                </div>

                {/* TOC sections */}
                {article.sections && article.sections.length > 0 && (
                  <nav className="text-sm">
                    {renderTableOfContents(article.sections)}
                  </nav>
                )}

                {/* Reference sections in TOC */}
                {article.referenceSections && article.referenceSections.length > 0 && (
                  <nav className="text-sm mt-4 pt-4 border-t border-border">
                    <button
                      onClick={() => {
                        setSidebarOpen(false);
                        const element = document.getElementById('references');
                        if (element) {
                          const yOffset = -120;
                          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                          window.scrollTo({ top: y, behavior: "smooth" });
                        }
                      }}
                      className="text-left w-full px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                    >
                      References
                    </button>
                  </nav>
                )}
              </div>
            </div>
          </aside>

          {/* Article content */}
          <main className="flex-1 min-w-0">
            <article>
              {/* Article header */}
              <div className="mb-8 pb-6 border-b border-border space-y-4">
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircledIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  Fact-checked by Etupedia {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} (Relax im not Elon)
                </p>
                <h1 className="font-space text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                  {article.title}
                </h1>
              </div>

              {/* Summary */}
              {showSummary && summary && (
                <div className="mb-8 p-6 bg-accent/50 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <path d="m3 11 18-5v12L3 14v-3z" />
                        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                      </svg>
                      <h2 className="font-space font-semibold text-lg">
                        Summary <span className="text-muted-foreground font-normal">(beta)</span>
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowSummary(false)}
                      className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                      aria-label="Close summary"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                  <p className="text-base leading-relaxed text-foreground/90">
                    {summary}
                  </p>
                </div>
              )}

              {/* Article body */}
              <ArticleContent
                content={article.content}
                language={searchParams.get('lang') || currentLanguage}
              />

              {/* References sections */}
              {article.referenceSections && article.referenceSections.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border">
                  <h2 id="references" className="font-space font-bold text-2xl mb-6 scroll-mt-24">
                    References
                  </h2>
                  {article.referenceSections.map((section: any, sectionIdx: number) => (
                    <div key={section.id} className={sectionIdx > 0 ? "mt-8" : ""}>
                      <h3 id={section.id} className="font-space font-semibold text-base mb-4 scroll-mt-24">
                        {section.title}
                      </h3>
                      <ol className="references-list">
                        {section.items.map((ref: any) => (
                          <li key={`${section.id}-${ref.number}`} className="reference-item">
                            <span className="reference-number">{ref.number}.</span>
                            <div
                              className="reference-content"
                              dangerouslySetInnerHTML={{ __html: ref.html || ref.text }}
                              onClick={(e) => {
                                // Handle Etupedia link clicks
                                const target = e.target as HTMLElement;
                                if (target.tagName === 'A') {
                                  const link = target as HTMLAnchorElement;
                                  if (link.hasAttribute('data-etupedia-link')) {
                                    e.preventDefault();
                                    const slug = link.getAttribute('data-etupedia-link');
                                    if (slug) {
                                      window.location.href = `/article/${slug}`;
                                    }
                                  }
                                }
                              }}
                            />
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}

              {/* Source information */}
              {article.source && (
                <div className="mt-12 pt-6 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    The content is adapted from{" "}
                    {article.url ? (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                      >
                        Wikipedia
                      </a>
                    ) : (
                      <span>Wikipedia</span>
                    )}
                    , licensed under Creative Commons Attribution-ShareAlike 4.0 License.
                  </p>
                </div>
              )}
            </article>
          </main>
        </div>
      </div>

      {/* AI Assistant Panel - Desktop only */}
      {article && (
        <ArticleAssistant
          articleTitle={article.title}
          articleContent={article.content}
          isOpen={assistantOpen}
          onClose={() => setAssistantOpen(false)}
        />
      )}
    </div>
  );
}
