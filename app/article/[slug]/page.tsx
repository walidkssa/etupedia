"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { ArticleWithTOC } from "@/lib/types";
import { useLanguage } from "@/hooks/use-language";
import { ArticleHeader } from "@/components/article-header";
import { ArticleHeroV2 } from "@/components/article-hero-v2";
import { BottomNavV2 } from "@/components/bottom-nav-v2";
import { LanguageModalV2 } from "@/components/language-modal-v2";
import { TextSizeModalV2 } from "@/components/text-size-modal-v2";
import { ShareModalV2 } from "@/components/share-modal-v2";
import { ArticleContent } from "@/components/article-content";
import { TableOfContents } from "@/components/table-of-contents";

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const searchParams = useSearchParams();
  const { currentLanguage, mounted } = useLanguage();
  const [article, setArticle] = useState<ArticleWithTOC | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  // Modal states
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [textSizeModalOpen, setTextSizeModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Text size state
  const [textSize, setTextSize] = useState(16);
  const [selectedText, setSelectedText] = useState<string>("");
  const [activeSection, setActiveSection] = useState<string>("");

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

  // Handle text selection for share
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        setSelectedText(selection.toString());
      }
    };

    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("touchend", handleSelection);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("touchend", handleSelection);
    };
  }, []);

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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLanguageChange = (lang: string) => {
    // Fetch article in new language
    fetchArticle(slug, lang);
  };

  const scrollToSection = (sectionId: string) => {
    setMenuOpen(false);

    const element = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (element) {
      const yOffset = -80; // Account for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Track active section on scroll
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold mb-2">Article not found</h1>
        <p className="text-muted-foreground">
          The article you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  // Use infobox image (main Wikipedia image) for hero and modals
  const coverImage = article.infoboxImage || article.content.match(/<img[^>]+src="([^">]+)"/)?.[1];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <ArticleHeader
        onMenuClick={() => setMenuOpen(!menuOpen)}
        onThemeToggle={toggleTheme}
        isDark={theme === "dark"}
      />

      {/* Hero Image - moins haute */}
      <div className="pt-14">
        <ArticleHeroV2 title={article.title} image={coverImage} />
      </div>

      {/* Main Container with Sidebar for Desktop */}
      <div className="max-w-7xl mx-auto lg:flex lg:gap-8 lg:px-8">
        {/* Table of Contents - Desktop Only */}
        <aside className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto py-8">
          {article.sections && article.sections.length > 0 && (
            <TableOfContents
              sections={article.sections}
              activeSection={activeSection}
              onSectionClick={scrollToSection}
            />
          )}
        </aside>

        {/* Article Content */}
        <main className="flex-1 min-w-0 px-4 md:px-6 lg:px-0">
          {/* Title - Gris, directement sous l'image */}
          <div className="py-6 md:py-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 text-muted-foreground">
              {article.title}
            </h1>
          </div>

          {/* Article Body */}
          <div
            className="article-body py-8 max-w-3xl"
            style={{ fontSize: `${textSize}px` }}
          >
            <ArticleContent
              content={article.content}
              language={currentLanguage}
            />
          </div>
        </main>

        {/* Right Sidebar - Optional for future features */}
        <aside className="hidden xl:block xl:w-64 flex-shrink-0"></aside>
      </div>

      {/* Bottom Navigation V2 - Mobile Only */}
      <BottomNavV2
        onLanguageClick={() => setLanguageModalOpen(true)}
        onTextSizeClick={() => setTextSizeModalOpen(true)}
        onShareClick={() => setShareModalOpen(true)}
        onBookmarkClick={() => {
          // TODO: Implement bookmark functionality
        }}
      />

      {/* Modals V2 avec image blur */}
      <LanguageModalV2
        isOpen={languageModalOpen}
        onClose={() => setLanguageModalOpen(false)}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        coverImage={coverImage}
      />

      <TextSizeModalV2
        isOpen={textSizeModalOpen}
        onClose={() => setTextSizeModalOpen(false)}
        currentSize={textSize}
        onSizeChange={setTextSize}
        coverImage={coverImage}
      />

      <ShareModalV2
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        articleTitle={article.title}
        articleExcerpt={article.content.replace(/<[^>]*>/g, '').substring(0, 200)}
        articleImage={coverImage}
        articleUrl={typeof window !== 'undefined' ? window.location.href : ''}
        selectedText={selectedText}
        coverImage={coverImage}
      />
    </div>
  );
}
