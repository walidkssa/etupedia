import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import axios, { AxiosInstance } from "axios";
import { getReferenceSectionTitles } from "../reference-translations";

export interface Reference {
  number: number;
  text: string;
  html?: string;
  url?: string;
  isWikipediaLink?: boolean;
  wikipediaSlug?: string;
}

export interface ReferenceSection {
  title: string;
  id: string;
  items: Reference[];
}

export interface ScrapedArticle {
  title: string;
  content: string;
  excerpt: string;
  sections: Section[];
  source: string;
  url: string;
  lastUpdated?: string;
  images?: string[];
  authors?: string[];
  publicationDate?: string;
  doi?: string;
  keywords?: string[];
  references?: Reference[]; // Deprecated: kept for backwards compatibility
  referenceSections?: ReferenceSection[];
}

export interface Section {
  id: string;
  title: string;
  level: number;
  subsections?: Section[];
}

export interface SearchResult {
  title: string;
  excerpt: string;
  slug: string;
  source: string;
  url: string;
  relevanceScore?: number;
}

export abstract class BaseScraper {
  protected client: AxiosInstance;
  protected sourceName: string;
  protected baseUrl: string;

  constructor(sourceName: string, baseUrl: string) {
    this.sourceName = sourceName;
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Etupedia/1.0; +https://etupedia.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
  }

  /**
   * Search for articles matching the query
   */
  abstract search(query: string, limit?: number): Promise<SearchResult[]>;

  /**
   * Scrape a single article by identifier (title, DOI, URL, etc.)
   */
  abstract scrapeArticle(identifier: string): Promise<ScrapedArticle | null>;

  /**
   * Clean HTML content by removing unwanted elements
   */
  protected cleanContent($: cheerio.CheerioAPI, selector: string): cheerio.Cheerio<AnyNode> {
    const content = $(selector);

    // Remove unwanted elements
    content.find('script, style, nav, header, footer, aside, .mw-editsection, .reference, .navbox, .infobox, .sidebar, .advertisement, .cookie-notice').remove();
    content.find('[role="navigation"], [aria-label="navigation"]').remove();

    // Clean up links
    content.find('a').each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href');
      if (href && href.startsWith('/')) {
        $el.attr('href', this.baseUrl + href);
      }
    });

    // Clean up images
    content.find('img').each((_, img) => {
      const $img = $(img);
      const src = $img.attr('src');
      if (src && src.startsWith('//')) {
        $img.attr('src', 'https:' + src);
      } else if (src && src.startsWith('/')) {
        $img.attr('src', this.baseUrl + src);
      }
    });

    return content;
  }

  /**
   * Extract sections from content
   * @param $ - Cheerio instance
   * @param contentSelector - CSS selector for content area
   * @param languageCode - Wikipedia language code for multilingual reference detection
   */
  protected extractSections($: cheerio.CheerioAPI, contentSelector: string, languageCode: string = 'en'): Section[] {
    const sections: Section[] = [];
    let hitReferenceSection = false;

    $(contentSelector).find('h2, h3, h4, h5, h6').each((_, element) => {
      // Stop extracting sections once we hit a reference section
      if (hitReferenceSection) {
        return false; // break the loop
      }

      const $el = $(element);
      const tagName = element.tagName.toLowerCase();
      const level = parseInt(tagName.charAt(1)) - 1; // h2 = 1, h3 = 2, etc.
      const title = $el.text().trim();
      const id = $el.attr('id') || this.slugify(title);

      // If we hit a reference section, mark it and stop
      // Works for all languages: "References", "Références", "Referenzen", etc.
      if (this.shouldSkipSection(title, languageCode)) {
        hitReferenceSection = true;
        return false; // break the loop
      }

      sections.push({ id, title, level });
    });

    return this.buildSectionHierarchy(sections);
  }

  /**
   * Build hierarchical section structure
   */
  protected buildSectionHierarchy(sections: Section[]): Section[] {
    const hierarchy: Section[] = [];
    const stack: Section[] = [];

    for (const section of sections) {
      // Pop sections with equal or higher level
      while (stack.length > 0 && stack[stack.length - 1].level >= section.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        hierarchy.push(section);
      } else {
        const parent = stack[stack.length - 1];
        if (!parent.subsections) {
          parent.subsections = [];
        }
        parent.subsections.push(section);
      }

      stack.push(section);
    }

    return hierarchy;
  }

  /**
   * Check if a section should be skipped
   * @param title - Section title to check
   * @param languageCode - Wikipedia language code for multilingual detection
   */
  protected shouldSkipSection(title: string, languageCode: string = 'en'): boolean {
    // Get all reference section titles for this language
    const referenceTitles = getReferenceSectionTitles(languageCode);

    // Also include English titles as fallback
    const englishTitles = languageCode !== 'en' ? getReferenceSectionTitles('en') : [];

    // Additional generic skip titles
    const genericSkipTitles = ['navigation', 'menu', 'explanatory notes', 'general bibliography'];

    // Combine all titles to check
    const allSkipTitles = [...referenceTitles, ...englishTitles, ...genericSkipTitles];

    const normalizedTitle = title.toLowerCase().trim();
    return allSkipTitles.some(skip => normalizedTitle === skip.toLowerCase());
  }

  /**
   * Extract references from Wikipedia-style reference list
   */
  protected extractReferences($: cheerio.CheerioAPI): Reference[] {
    const references: Reference[] = [];

    // Try to find references in different formats
    // Wikipedia uses <ol class="references"> or <div class="reflist">
    const refLists = $('.references li, .reflist li, .refbegin li');

    refLists.each((index, element) => {
      const $ref = $(element);

      // Remove cite backlinks
      $ref.find('.mw-cite-backlink, .reference-text').remove();

      const text = $ref.text().trim();
      const link = $ref.find('a[href^="http"]').first().attr('href');

      if (text) {
        references.push({
          number: index + 1,
          text,
          url: link,
        });
      }
    });

    // If no references found, try alternative formats
    if (references.length === 0) {
      $('#References ~ ol li, #Citations ~ ol li, #Notes ~ ol li').each((index, element) => {
        const $ref = $(element);
        const text = $ref.text().trim();
        const link = $ref.find('a[href^="http"]').first().attr('href');

        if (text) {
          references.push({
            number: index + 1,
            text,
            url: link,
          });
        }
      });
    }

    return references; // No limit - return all references
  }

  /**
   * Extract structured reference sections from Wikipedia-style articles
   *
   * IMPORTANT: Wikipedia's HTML structure uses div.mw-heading wrappers around h2/h3 tags.
   * The actual content (lists, divs) are siblings of these wrapper divs, not the headings themselves.
   *
   * Example structure:
   * <div class="mw-heading mw-heading2">
   *   <h2 id="References">References</h2>
   * </div>
   * <div class="mw-heading mw-heading3">
   *   <h3 id="Notes">Notes</h3>
   * </div>
   * <div class="reflist">
   *   <ol class="references">
   *     <li>Reference content...</li>
   *   </ol>
   * </div>
   *
   * @param $ - Cheerio instance
   * @param languageCode - Wikipedia language code (e.g., 'en', 'fr', 'de') for multilingual support
   */
  protected extractReferenceSections($: cheerio.CheerioAPI, languageCode: string = 'en'): ReferenceSection[] {
    const sections: ReferenceSection[] = [];

    // Get reference section titles for the specified language
    // This allows us to detect "Références" in French, "Referenzen" in German, etc.
    // All will be displayed under "References" in English on Etupedia
    const sectionTitles = getReferenceSectionTitles(languageCode);

    // Process each section title
    sectionTitles.forEach(sectionTitle => {
      // Find heading by ID (most reliable method for Wikipedia)
      // Wikipedia uses IDs like "References", "See_also", "External_links", etc.
      const searchId = sectionTitle.replace(/\s+/g, '_');
      let $heading = $(`#${searchId}`);

      // Fallback: search by text content if ID not found
      if ($heading.length === 0) {
        $heading = $('h2, h3').filter((_, el) => {
          const text = $(el).text().trim();
          return text.toLowerCase() === sectionTitle.toLowerCase();
        }).first();
      }

      if ($heading.length === 0) return;

      // Get the heading text and ID
      const headingText = $heading.text().trim();
      const headingId = $heading.attr('id') || this.slugify(headingText);
      const headingElement = $heading.get(0);
      const headingTag = headingElement && 'tagName' in headingElement
        ? headingElement.tagName.toLowerCase()
        : 'h2';

      // Get the wrapper div (Wikipedia wraps headings in div.mw-heading)
      const $headingWrapper = $heading.parent().hasClass('mw-heading')
        ? $heading.parent()
        : $heading;

      // Collect items from all content until next heading of same or higher level
      const items: Reference[] = [];
      let refNumber = 1;
      let $sibling = $headingWrapper.next();
      let depth = 0;
      const maxDepth = 50; // Safety limit
      let hasSubsections = false; // Track if this section has subsections

      while ($sibling.length > 0 && depth < maxDepth) {
        depth++;

        // Stop if we hit another heading of same or higher level
        if ($sibling.hasClass('mw-heading')) {
          // Check heading level
          if (headingTag === 'h2' && $sibling.hasClass('mw-heading2')) {
            break; // Hit next main section (another h2)
          }
          if (headingTag === 'h3' && ($sibling.hasClass('mw-heading2') || $sibling.hasClass('mw-heading3'))) {
            break; // Hit next section at same or higher level
          }
          if (headingTag === 'h2' && $sibling.hasClass('mw-heading3')) {
            // For h2 sections, if we hit a h3 subsection, mark it and stop collecting
            // The h3 will be processed separately in the loop
            hasSubsections = true;
            break;
          }
          // If it's a lower-level heading (e.g., h4 under h3), continue to collect its content
        }

        // Process list items from various structures
        this.extractListItemsFromElement($, $sibling, items, refNumber);

        $sibling = $sibling.next();
      }

      // Only add section if it has items AND no subsections
      // (if it has subsections, those will be added separately as h3 sections)
      if (items.length > 0 && !hasSubsections) {
        sections.push({
          title: headingText,
          id: headingId,
          items: items, // No limit - return all items
        });
      }
    });

    return sections;
  }

  /**
   * Helper function to extract list items from an element
   * Handles various Wikipedia structures: direct lists, reflist divs, div-col, etc.
   */
  private extractListItemsFromElement(
    $: cheerio.CheerioAPI,
    $element: cheerio.Cheerio<any>,
    items: Reference[],
    startNumber: number
  ): void {
    let refNumber = startNumber + items.length;

    // Helper to process a single list item
    const processListItem = (li: any) => {
      const $li = $(li);
      const $liClone = $li.clone();

      // Remove cite backlinks and edit links
      $liClone.find('.mw-cite-backlink, .mw-editsection').remove();

      // Process all links in the item
      $liClone.find('a').each((_, link) => {
        const $link = $(link);
        const href = $link.attr('href');

        if (href && href.startsWith('/wiki/')) {
          // Internal Wikipedia link (relative) - convert to Etupedia
          const slug = href.replace('/wiki/', '');
          $link.attr('data-etupedia-link', slug);
          $link.attr('href', `/article/${slug}`);
        } else if (href && (href.includes('wikipedia.org/wiki/') || href.includes('wikipedia.org/w/'))) {
          // Internal Wikipedia link (absolute) - convert to Etupedia
          // Extract slug from URL like https://en.wikipedia.org/wiki/Animal_track
          const match = href.match(/\/wiki\/([^#?]+)/);
          if (match) {
            const slug = match[1];
            $link.attr('data-etupedia-link', slug);
            $link.attr('href', `/article/${slug}`);
          }
        } else if (href && href.startsWith('http')) {
          // External link - add target blank
          $link.attr('target', '_blank');
          $link.attr('rel', 'noopener noreferrer');
        }
      });

      const text = $liClone.text().trim();
      const html = $liClone.html() || '';

      if (text) {
        items.push({
          number: refNumber++,
          text,
          html,
        });
      }
    };

    // Direct list (ol or ul)
    if ($element.is('ol, ul')) {
      $element.find('li').each((_, li) => processListItem(li));
    }
    // Div with class reflist, references, div-col, etc.
    else if ($element.hasClass('reflist') ||
             $element.hasClass('references') ||
             $element.hasClass('refbegin') ||
             $element.hasClass('div-col')) {
      $element.find('li').each((_, li) => processListItem(li));
    }
    // Skip style, link, script tags
    else if ($element.is('style, link, script')) {
      return;
    }
  }

  /**
   * Create a URL-friendly slug from text
   */
  protected slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Extract text excerpt from HTML
   */
  protected extractExcerpt($: cheerio.CheerioAPI, selector: string, maxLength: number = 200): string {
    const text = $(selector)
      .first()
      .text()
      .trim()
      .replace(/\s+/g, ' ');

    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  /**
   * Retry a request with exponential backoff
   */
  protected async retryRequest<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
    throw new Error('Max retries exceeded');
  }
}
