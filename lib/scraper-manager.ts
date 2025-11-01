import { WikipediaScraper } from "./scrapers/wikipedia-scraper";
import { BaseScraper, ScrapedArticle, SearchResult } from "./scrapers/base-scraper";

/**
 * Central scraper manager that aggregates results from multiple sources
 */
export class ScraperManager {
  private scrapers: Map<string, BaseScraper>;
  private cache: Map<string, { data: unknown; timestamp: number }>;
  private readonly cacheExpiry = 1000 * 60 * 60; // 1 hour

  constructor() {
    this.scrapers = new Map();
    this.cache = new Map();

    // Register Wikipedia scraper (6.9M+ articles)
    this.registerScraper("wikipedia", new WikipediaScraper());
  }

  /**
   * Register a new scraper
   */
  private registerScraper(name: string, scraper: BaseScraper) {
    this.scrapers.set(name, scraper);
  }

  /**
   * Get from cache if available and not expired
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data as T;
    }
    return null;
  }

  /**
   * Save to cache
   */
  private saveToCache<T>(key: string, data: T) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Calculate improved relevance score based on query match
   */
  private calculateRelevanceScore(query: string, result: SearchResult, originalScore: number): number {
    const queryLower = query.toLowerCase().trim();
    const titleLower = result.title.toLowerCase();
    const words = queryLower.split(/\s+/);

    let score = originalScore;

    // Exact match: huge boost
    if (titleLower === queryLower) {
      score += 10;
    }
    // Title starts with query: big boost
    else if (titleLower.startsWith(queryLower)) {
      score += 5;
    }
    // Query is contained in title: good boost
    else if (titleLower.includes(queryLower)) {
      score += 3;
    }

    // Count matching words
    let matchingWords = 0;
    for (const word of words) {
      if (word.length > 2 && titleLower.includes(word)) {
        matchingWords++;
      }
    }

    // Boost based on word matches
    const wordMatchRatio = matchingWords / words.length;
    score += wordMatchRatio * 2;

    // Penalize very long titles (likely less relevant)
    if (titleLower.length > queryLower.length * 5) {
      score -= 0.5;
    }

    return score;
  }

  /**
   * Check if two titles are similar (for smart deduplication)
   * Only consider titles as duplicates if they are VERY similar (exact match or minor variations)
   */
  private areTitlesSimilar(title1: string, title2: string): boolean {
    const t1 = title1.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
    const t2 = title2.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();

    // Exact match after normalization
    if (t1 === t2) return true;

    // Only consider as duplicate if:
    // 1. One is substring of the other AND
    // 2. The difference is very small (< 5 chars, like parentheses or "the")
    // This handles cases like "France" vs "France (country)" but NOT "France" vs "France in World War II"
    if (t1.includes(t2) || t2.includes(t1)) {
      return Math.abs(t1.length - t2.length) < 5;
    }

    return false;
  }

  /**
   * Search across all sources
   */
  async search(query: string, sources?: string[], language?: string): Promise<SearchResult[]> {
    // Use provided language or detect from query
    const lang = language || WikipediaScraper.detectLanguage(query);

    // If no sources specified, search ALL available scrapers
    const searchSources = sources || Array.from(this.scrapers.keys());

    const cacheKey = `search:${query}:${searchSources.join(",")}:${lang}`;
    const cached = this.getFromCache<SearchResult[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const results: SearchResult[] = [];

    // Search in parallel across all requested sources
    const searchPromises = searchSources.map(async (source) => {
      const scraper = this.scrapers.get(source);
      if (!scraper) {
        console.warn(`Scraper not found: ${source}`);
        return [];
      }

      try {
        // Create language-specific scraper if it's Wikipedia
        if (source === "wikipedia") {
          const langScraper = new WikipediaScraper(lang);
          return await langScraper.search(query, 50);
        }

        // Request more results (increased from 10 to 50)
        return await scraper.search(query, 50);
      } catch (error) {
        console.error(`Error searching ${source}:`, error);
        return [];
      }
    });

    const allResults = await Promise.all(searchPromises);

    // Flatten results
    let flatResults = allResults.flat();

    // Multi-keyword AND logic: filter results to only include those with ALL keywords
    const keywords = query.toLowerCase().trim().split(/\s+/).filter(word => word.length > 0);
    if (keywords.length > 1) {
      flatResults = flatResults.filter((result) => {
        const searchableText = [
          result.title,
          result.excerpt || "",
        ].join(" ").toLowerCase();

        // Check if ALL keywords are present in the searchable text
        return keywords.every(keyword => searchableText.includes(keyword));
      });
    }

    // Recalculate scores with improved algorithm
    for (const result of flatResults) {
      result.relevanceScore = this.calculateRelevanceScore(
        query,
        result,
        result.relevanceScore || 0
      );
    }

    // Sort by relevance
    flatResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    // Smart deduplication - no limit
    const seen: SearchResult[] = [];
    for (const result of flatResults) {
      const isDuplicate = seen.some((seenResult) =>
        this.areTitlesSimilar(result.title, seenResult.title)
      );

      if (!isDuplicate) {
        seen.push(result);
        results.push(result);
      }
    }

    this.saveToCache(cacheKey, results);
    return results;
  }

  /**
   * Scrape an article from a specific source
   */
  async scrapeArticle(slug: string, source: string = "wikipedia", language: string = "en"): Promise<ScrapedArticle | null> {
    const cacheKey = `article:${source}:${language}:${slug}`;
    const cached = this.getFromCache<ScrapedArticle>(cacheKey);
    if (cached) {
      return cached;
    }

    // Create language-specific scraper if it's Wikipedia
    let scraper = this.scrapers.get(source);
    if (source === "wikipedia") {
      scraper = new WikipediaScraper(language);
    }

    if (!scraper) {
      console.error(`Scraper not found: ${source}`);
      return null;
    }

    try {
      const article = await scraper.scrapeArticle(slug);
      if (article) {
        this.saveToCache(cacheKey, article);
      }
      return article;
    } catch (error) {
      console.error(`Error scraping article from ${source}:`, error);
      return null;
    }
  }

  /**
   * Try to scrape an article from multiple sources
   * DEPRECATED: Now using Wikipedia only for reliability
   */
  async scrapeArticleMultiSource(slug: string, sources: string[] = ["wikipedia"]): Promise<ScrapedArticle | null> {
    // Simplified: only use Wikipedia
    return await this.scrapeArticle(slug, "wikipedia");
  }

  /**
   * Get article count across all sources (estimated)
   */
  async getArticleCount(): Promise<number> {
    // Wikipedia English: 6,900,000+ articles
    // This is the most comprehensive academic encyclopedia available
    return 6500000;
  }

  /**
   * Get featured/recommended articles
   */
  async getFeaturedArticles(source: string = "wikipedia", limit: number = 10): Promise<SearchResult[]> {
    const scraper = this.scrapers.get(source);
    if (!scraper) {
      return [];
    }

    // Check if scraper has getFeaturedArticles method
    if (typeof (scraper as any).getFeaturedArticles !== 'function') {
      return [];
    }

    try {
      return await (scraper as any).getFeaturedArticles(limit);
    } catch (error) {
      console.error(`Error getting featured articles from ${source}:`, error);
      return [];
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get available scrapers
   */
  getAvailableScrapers(): string[] {
    return Array.from(this.scrapers.keys());
  }
}

// Export singleton instance
export const scraperManager = new ScraperManager();
