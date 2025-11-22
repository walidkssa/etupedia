import * as cheerio from "cheerio";
import { BaseScraper, ScrapedArticle, SearchResult } from "./base-scraper";

export class WikipediaScraper extends BaseScraper {
  private languageCode: string;

  constructor(languageCode: string = "en") {
    super("Wikipedia", `https://${languageCode}.wikipedia.org`);
    this.languageCode = languageCode;
  }

  /**
   * Detect language from query text using simple heuristics
   */
  static detectLanguage(query: string): string {
    // Common French words/patterns
    const frenchPatterns = /\b(le|la|les|un|une|des|et|est|pour|dans|avec|sur|par|plus|comme|mais|son|ses|ce|cette|qui|tout|tous|faire|être|avoir|dit|faire)\b/i;

    // Common German words/patterns
    const germanPatterns = /\b(der|die|das|ein|eine|und|ist|für|in|mit|auf|von|den|dem|zu|sich|nicht|auch|oder|als|des|im|dem|zum|zur)\b/i;

    // Common Spanish words/patterns
    const spanishPatterns = /\b(el|la|los|las|un|una|de|del|y|en|es|por|para|con|que|su|al|como|más|pero|sus|le|ya|todo|esta|este)\b/i;

    // Common Italian words/patterns
    const italianPatterns = /\b(il|lo|la|i|gli|le|un|uno|una|di|da|in|con|su|per|tra|fra|a|come|più|che|non|nel|della|alla|dal|al)\b/i;

    // Check for special characters common in certain languages
    const hasFrenchChars = /[àâäéèêëïîôùûüÿœæç]/i.test(query);
    const hasGermanChars = /[äöüß]/i.test(query);
    const hasSpanishChars = /[áéíóúüñ¿¡]/i.test(query);

    if (frenchPatterns.test(query) || hasFrenchChars) return "fr";
    if (germanPatterns.test(query) || hasGermanChars) return "de";
    if (spanishPatterns.test(query) || hasSpanishChars) return "es";
    if (italianPatterns.test(query)) return "it";

    return "en"; // default to English
  }

  async search(query: string, limit: number = 50): Promise<SearchResult[]> {
    try {
      const results: SearchResult[] = [];

      // 1. Title search (opensearch) - high relevance
      const titleResponse = await this.retryRequest(() =>
        this.client.get("/w/api.php", {
          params: {
            action: "opensearch",
            search: query,
            limit: Math.min(limit, 500), // Increased to 500 max for more results
            namespace: 0,
            format: "json",
          },
        })
      );

      const [, titles, excerpts, urls] = titleResponse.data;

      for (let i = 0; i < titles.length; i++) {
        results.push({
          title: titles[i],
          excerpt: excerpts[i] || "",
          slug: this.slugify(titles[i]),
          source: this.sourceName,
          url: urls[i],
          relevanceScore: 2.0 - (i / titles.length), // Higher score for title matches
        });
      }

      // 2. Full-text search (search all content including sections)
      try {
        const fullTextResponse = await this.retryRequest(() =>
          this.client.get("/w/api.php", {
            params: {
              action: "query",
              list: "search",
              srsearch: query,
              srlimit: Math.min(limit, 500), // Increased to 500 max for more results
              srnamespace: 0,
              srprop: "snippet|titlesnippet|sectionsnippet",
              format: "json",
            },
          })
        );

        const searchResults = fullTextResponse.data.query?.search || [];

        for (const result of searchResults) {
          // Skip if already in results from title search
          const alreadyExists = results.some(
            r => r.title.toLowerCase() === result.title.toLowerCase()
          );

          if (!alreadyExists) {
            results.push({
              title: result.title,
              excerpt: result.snippet?.replace(/<[^>]*>/g, "") || "",
              slug: this.slugify(result.title),
              source: this.sourceName,
              url: `${this.baseUrl}/wiki/${encodeURIComponent(result.title.replace(/\s+/g, "_"))}`,
              relevanceScore: 1.0 + (result.wordcount || 0) / 10000, // Score based on content match
            });
          }
        }
      } catch (fullTextError) {
        console.warn("Full-text search failed, using title search only");
      }

      return results;
    } catch (error) {
      console.error("Wikipedia search error:", error);
      return [];
    }
  }

  /**
   * Get English Wikipedia page title from any language
   */
  private async getEnglishTitle(title: string): Promise<string | null> {
    try {
      // First try to search for the English version
      const searchResponse = await this.retryRequest(() =>
        this.client.get("/w/api.php", {
          params: {
            action: "opensearch",
            search: title,
            limit: 1,
            namespace: 0,
            format: "json",
          },
        })
      );

      const [, titles] = searchResponse.data;
      if (titles && titles.length > 0) {
        return titles[0];
      }

      // If search fails, try to get interlanguage links
      const pageResponse = await this.retryRequest(() =>
        this.client.get("/w/api.php", {
          params: {
            action: "query",
            titles: title,
            prop: "langlinks",
            lllang: "en",
            format: "json",
          },
        })
      );

      const pages = pageResponse.data.query.pages;
      const page = Object.values(pages)[0] as any;
      if (page && page.langlinks && page.langlinks.length > 0) {
        return page.langlinks[0]["*"];
      }

      return null;
    } catch (error) {
      console.error("Error getting English title:", error);
      return null;
    }
  }

  async scrapeArticle(identifier: string): Promise<ScrapedArticle | null> {
    try {
      // Decode URL-encoded characters first (handles cases like Yog%C4%81c%C4%81ra)
      // Then convert slug/identifier to Wikipedia title format
      let title = decodeURIComponent(identifier).replace(/-/g, " ").replace(/_/g, " ");

      // Try to get the English version of the title
      const englishTitle = await this.getEnglishTitle(title);
      if (englishTitle) {
        title = englishTitle;
      }

      // Normalize the title using Wikipedia API to handle special characters and redirects
      let normalizedTitle = title;
      try {
        const searchUrl = `${this.baseUrl}/w/api.php?action=query&titles=${encodeURIComponent(title)}&redirects=1&format=json`;
        const searchResponse = await this.retryRequest(() => this.client.get(searchUrl));
        const pages = searchResponse.data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pageId !== '-1' && pages[pageId].title) {
          normalizedTitle = pages[pageId].title;
        }
      } catch (error) {
        console.log("Title normalization skipped, using original title");
      }

      // Build URL with properly encoded title
      const url = `${this.baseUrl}/wiki/${encodeURIComponent(normalizedTitle.replace(/\s+/g, "_"))}`;

      const response = await this.retryRequest(() => this.client.get(url));
      const $ = cheerio.load(response.data);

      // Extract title
      const pageTitle = $("#firstHeading").text().trim();
      if (!pageTitle) {
        return null;
      }

      // Extract main content
      const contentSelector = "#mw-content-text .mw-parser-output";
      const content = this.cleanContent($, contentSelector);

      // Extract infobox image FIRST (this is the main article image)
      let infoboxImage: string | null = null;
      const infobox = $('.infobox, .infobox-image, table.infobox');
      if (infobox.length > 0) {
        // Try to find the main image in the infobox
        const infoboxImg = infobox.find('img').first();
        if (infoboxImg.length > 0) {
          let src = infoboxImg.attr('src');
          if (src) {
            const fullUrl = src.startsWith('//') ? 'https:' + src : src;
            infoboxImage = `/api/proxy-image?url=${encodeURIComponent(fullUrl)}`;
          }
        }
      }

      // Proxy all Wikipedia images through our API to fix CORS issues
      content.find('img').each((_, img) => {
        const $img = $(img);
        const src = $img.attr('src');
        if (src && (src.startsWith('https:') || src.startsWith('//'))) {
          const fullUrl = src.startsWith('//') ? 'https:' + src : src;
          const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(fullUrl)}`;
          $img.attr('src', proxiedUrl);
        }
      });

      // Extract sections with language-aware reference detection
      const sections = this.extractSections($, contentSelector, this.languageCode);

      // Build cleaned HTML content with section IDs
      // We need to traverse direct children in order to respect DOM structure
      let htmlContent = "";
      let stopProcessing = false;

      // Get direct children of content and process them in order
      const processElement = ($el: cheerio.Cheerio<any>, depth: number = 0): boolean => {
        if (stopProcessing) return false;

        const tagName = $el.prop("tagName")?.toLowerCase();
        if (!tagName) return true;

        // Check if this is a heading
        if (["h2", "h3", "h4", "h5", "h6"].includes(tagName)) {
          const title = $el.text().trim();
          // If we hit a reference section, stop ALL processing
          // This works for all languages: "References" in English, "Références" in French, etc.
          if (this.shouldSkipSection(title, this.languageCode)) {
            stopProcessing = true;
            return false;
          }
          const id = $el.attr("id") || this.slugify(title);
          const cleanTitle = $el.clone().find(".mw-editsection").remove().end().text().trim();
          htmlContent += `<${tagName} data-section-id="${id}">${cleanTitle}</${tagName}>`;
        } else if (["p", "ul", "ol", "blockquote", "figure", "table"].includes(tagName)) {
          htmlContent += $.html($el);
        } else if (tagName === "div" && depth === 0) {
          // Process div children at top level only
          $el.children().each((_, child) => {
            if (stopProcessing) return false;
            const shouldContinue = processElement($(child), depth + 1);
            return shouldContinue; // false will break the .each loop
          });
        }

        return !stopProcessing;
      };

      // Process all direct children of the content
      content.children().each((_, child) => {
        if (stopProcessing) return false;
        const shouldContinue = processElement($(child));
        return shouldContinue; // false will break the .each loop
      });

      // Extract excerpt
      const excerpt = this.extractExcerpt($, contentSelector + " > p", 300);

      // Extract images and proxy them through our API to handle CORS
      const images: string[] = [];
      content.find("img").each((_, img) => {
        const src = $(img).attr("src");
        if (src && src.startsWith("//")) {
          const fullUrl = "https:" + src;
          // Proxy Wikipedia images through our API to fix CORS issues with require-corp
          const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(fullUrl)}`;
          images.push(proxiedUrl);
        }
      });

      // Extract last modified date
      const lastUpdatedText = $("#footer-info-lastmod").text();
      const lastUpdated = lastUpdatedText
        ? lastUpdatedText.replace("This page was last edited on", "").trim()
        : "recently";

      // Extract categories as keywords
      const keywords: string[] = [];
      $(".mw-normal-catlinks ul li a").each((_, el) => {
        keywords.push($(el).text().trim());
      });

      // Extract references using new structured method with language support
      // This will detect "Références" in French, "Referenzen" in German, etc.
      const referenceSections = this.extractReferenceSections($, this.languageCode);

      // Keep old method for backwards compatibility
      const references = this.extractReferences($);

      return {
        title: pageTitle,
        content: htmlContent,
        excerpt,
        sections,
        source: this.sourceName,
        url,
        lastUpdated,
        images: images.slice(0, 10), // Limit to 10 images
        infoboxImage: infoboxImage || undefined, // Add infobox image
        keywords: keywords.slice(0, 10), // Limit to 10 keywords
        references: references.length > 0 ? references : undefined,
        referenceSections: referenceSections.length > 0 ? referenceSections : undefined,
      };
    } catch (error) {
      console.error("Wikipedia scrape error:", error);
      return null;
    }
  }

  /**
   * Get featured articles
   */
  async getFeaturedArticles(limit: number = 10): Promise<SearchResult[]> {
    try {
      const response = await this.retryRequest(() =>
        this.client.get("/w/api.php", {
          params: {
            action: "query",
            list: "categorymembers",
            cmtitle: "Category:Featured_articles",
            cmlimit: limit,
            format: "json",
          },
        })
      );

      const articles = response.data.query.categorymembers;

      return articles.map((article: any) => ({
        title: article.title,
        excerpt: "",
        slug: this.slugify(article.title),
        source: this.sourceName,
        url: `${this.baseUrl}/wiki/${encodeURIComponent(article.title.replace(/\s+/g, "_"))}`,
      }));
    } catch (error) {
      console.error("Wikipedia featured articles error:", error);
      return [];
    }
  }

  /**
   * Get random articles
   */
  async getRandomArticles(limit: number = 5): Promise<SearchResult[]> {
    try {
      const response = await this.retryRequest(() =>
        this.client.get("/w/api.php", {
          params: {
            action: "query",
            list: "random",
            rnnamespace: 0,
            rnlimit: limit,
            format: "json",
          },
        })
      );

      const articles = response.data.query.random;

      return articles.map((article: any) => ({
        title: article.title,
        excerpt: "",
        slug: this.slugify(article.title),
        source: this.sourceName,
        url: `${this.baseUrl}/wiki/${encodeURIComponent(article.title.replace(/\s+/g, "_"))}`,
      }));
    } catch (error) {
      console.error("Wikipedia random articles error:", error);
      return [];
    }
  }
}
