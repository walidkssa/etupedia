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
  url: string;
  source: string;
  sections?: Section[];
  infoboxImage?: string; // Main image from Wikipedia infobox
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
  excerpt?: string;
  slug: string;
  source: string;
  url: string;
  relevanceScore?: number;
}

export interface ArticleWithTOC extends ScrapedArticle {
  sections: Section[];
}
