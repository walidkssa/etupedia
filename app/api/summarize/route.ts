import { NextRequest } from "next/server";

// Advanced text quality analyzer
function analyzeTextQuality(sentence: string): number {
  let quality = 1.0;

  // Penalize sentences with too many special characters
  const specialChars = (sentence.match(/[^a-zA-Z0-9\s.,;:!?()\-']/g) || []).length;
  if (specialChars > 3) quality *= 0.5;

  // Penalize sentences with numbers only or mostly numbers
  const numberRatio = (sentence.match(/\d/g) || []).length / sentence.length;
  if (numberRatio > 0.3) quality *= 0.6;

  // Reward complete, well-formed sentences
  if (/^[A-Z]/.test(sentence) && /[.!?]$/.test(sentence)) quality *= 1.2;

  // Penalize sentences with parentheses (often citations)
  if (/\([^)]{3,}\)/.test(sentence)) quality *= 0.7;

  // Reward sentences with conjunctions (better narrative flow)
  if (/(however|moreover|furthermore|additionally|consequently|therefore|meanwhile|nevertheless|nonetheless)/i.test(sentence)) {
    quality *= 1.3;
  }

  return quality;
}

// Calculate semantic similarity between two sentences (Jaccard similarity)
function calculateSimilarity(sent1: string, sent2: string): number {
  const words1 = new Set(sent1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(sent2.toLowerCase().split(/\s+/).filter(w => w.length > 3));

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

// Check if sentence provides new information (not redundant)
function isNovelInformation(sentence: string, selectedSentences: string[]): boolean {
  // Check similarity with already selected sentences
  for (const selected of selectedSentences) {
    const similarity = calculateSimilarity(sentence, selected);
    if (similarity > 0.5) return false; // Too similar, redundant
  }
  return true;
}

// Detect sentence importance based on linguistic patterns
function detectImportance(sentence: string): number {
  let importance = 1.0;

  // Boost sentences with important verbs
  if (/(founded|established|created|invented|discovered|developed|became|led|served|known for|famous for|achieved|won|received)/i.test(sentence)) {
    importance *= 1.4;
  }

  // Boost sentences with temporal markers (historical facts)
  if (/(in \d{4}|during|after|before|since|until|from \d{4} to \d{4})/i.test(sentence)) {
    importance *= 1.25;
  }

  // Boost sentences with significant terms
  if (/(president|minister|leader|director|founder|creator|author|scientist|artist|war|revolution|treaty|agreement|law|act)/i.test(sentence)) {
    importance *= 1.2;
  }

  // Penalize speculative/uncertain statements
  if (/(may have|might have|could have|possibly|perhaps|allegedly|reportedly|supposedly)/i.test(sentence)) {
    importance *= 0.7;
  }

  return importance;
}

// Comprehensive extractive summarization with advanced NLP techniques
function comprehensiveSummarize(text: string, targetLength: number = 2250): string {
  // Split into sentences
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => {
      // Filter very short sentences
      if (s.length < 30 || s.split(/\s+/).length < 5) return false;

      // Filter sentences that look like titles or headers
      const wordCount = s.split(/\s+/).length;
      if (wordCount < 8 && /^[A-Z]/.test(s) && !s.includes(",")) return false;

      // Filter sentences with too many proper nouns (likely lists)
      const properNouns = s.match(/\b[A-Z][a-z]+/g) || [];
      if (properNouns.length > wordCount * 0.6) return false;

      // Filter article titles and media source patterns
      if (/^(Russian|English|French|German|Spanish|Chinese|Arabic):/i.test(s)) return false;
      if (/(BBC|CNN|Reuters|AP|AFP|The New York Times|The Guardian|Washington Post)/i.test(s)) return false;
      if (/"[^"]{10,}"/.test(s)) return false; // Filter quoted titles

      // Filter bibliographic citations - patterns like "Name, FirstName (Date)" or "(in Language)"
      if (/[A-Z][a-z]+,\s+[A-Z][a-z]+\s+\(\d{1,2}\s+\w+\s+\d{4}\)/i.test(s)) return false;
      if (/\(in (Russian|English|French|German|Spanish|Chinese|Arabic|Ukrainian|Polish|Italian)\)/i.test(s)) return false;
      if (/\[\w+\s+\w+[''']s\s+(Jargon|Biography|History|Story)\]/i.test(s)) return false;

      // Filter internal Wikipedia references
      if (/;\s*see\s+[A-Z]/i.test(s)) return false;
      if (/^see\s+also/i.test(s)) return false;

      // Filter sentences that start with common article/reference patterns
      if (/^(See |Read |Watch |Listen |Source |Photo |Image |Figure |Table |Chart |Dear |Note |According to sources)/i.test(s)) return false;

      // Filter sentences with isolated years or dates at start
      if (/^\d{4}[:\-]/.test(s)) return false;

      // Filter sentences that are mostly uppercase (likely headers)
      const uppercaseRatio = (s.match(/[A-Z]/g) || []).length / s.length;
      if (uppercaseRatio > 0.3) return false;

      // Filter sentences with malformed HTML entities
      if (/&lt;|&gt;|&amp;&amp;/.test(s)) return false;

      // Filter sentences that look like news headlines (short + contains "says" or direct quotes)
      if (wordCount < 20 && /(says|said|told|announced|declared|stated)\s+(that\s+)?[A-Z]/i.test(s)) return false;

      return true;
    });

  if (sentences.length === 0) {
    return "";
  }

  // Enhanced stop words
  const stopWords = new Set([
    "the", "is", "at", "which", "on", "a", "an", "and", "or", "but", "in", "with",
    "to", "for", "of", "as", "by", "from", "this", "that", "these", "those", "it",
    "its", "was", "were", "been", "be", "are", "has", "have", "had", "will", "would",
    "can", "could", "should", "may", "might", "must", "shall", "into", "through",
    "during", "before", "after", "above", "below", "between", "under", "again",
    "further", "then", "once", "here", "there", "when", "where", "why", "how",
    "all", "both", "each", "few", "more", "most", "other", "some", "such", "no",
    "nor", "not", "only", "own", "same", "so", "than", "too", "very", "also",
    "well", "just", "now", "even", "still", "however", "thus", "therefore"
  ]);

  // Calculate word frequencies and document frequencies
  const wordFreq: Record<string, number> = {};
  const docFreq: Record<string, number> = {};
  const allWords: string[] = [];

  sentences.forEach(sentence => {
    const words = sentence.toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w) && !/^\d+$/.test(w));

    const uniqueWords = new Set(words);
    uniqueWords.forEach(word => {
      docFreq[word] = (docFreq[word] || 0) + 1;
    });

    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
      allWords.push(word);
    });
  });

  // Calculate TF-IDF scores
  const totalDocs = sentences.length;
  const tfIdf: Record<string, number> = {};

  Object.keys(wordFreq).forEach(word => {
    const tf = wordFreq[word] / allWords.length;
    const idf = Math.log((totalDocs + 1) / (docFreq[word] + 1)) + 1;
    tfIdf[word] = tf * idf;
  });

  // Find top keywords
  const topKeywords = Object.entries(tfIdf)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word]) => word);

  // Score sentences with advanced multi-dimensional heuristics
  const sentenceScores = sentences.map((sentence, index) => {
    const words = sentence.toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    // Base TF-IDF score
    let score = 0;
    let keywordCount = 0;

    words.forEach(word => {
      const wordScore = tfIdf[word] || 0;
      score += wordScore;
      if (topKeywords.includes(word)) {
        keywordCount++;
      }
    });

    // Normalize by sentence length (with sqrt to not penalize long informative sentences)
    score = score / Math.sqrt(words.length || 1);

    // Apply text quality analysis
    const qualityScore = analyzeTextQuality(sentence);
    score *= qualityScore;

    // Apply importance detection
    const importanceScore = detectImportance(sentence);
    score *= importanceScore;

    // Position bonuses (optimized for encyclopedic content)
    const relativePosition = index / sentences.length;
    if (index < 3) score *= 2.0; // Extra strong boost for first sentences (often definitions)
    else if (index < 8) score *= 1.6; // Strong boost for introduction
    else if (index < 15) score *= 1.3; // Moderate boost for early content
    if (relativePosition > 0.85) score *= 1.4; // Boost conclusion

    // Keyword density bonus (indicates relevance)
    const keywordRatio = keywordCount / (words.length || 1);
    score *= (1 + keywordRatio * 2.5);

    // Sentence length bonus (prefer informative medium-long sentences)
    const sentenceLength = sentence.split(/\s+/).length;
    if (sentenceLength >= 12 && sentenceLength <= 30) {
      score *= 1.4; // Sweet spot for information density
    } else if (sentenceLength > 40) {
      score *= 0.8; // Penalize overly long sentences (hard to read)
    }

    // Numerical data bonus (dates, statistics = factual content)
    if (/\d{4}|\d+%|\d+\s*(million|billion|thousand|percent|years?)/.test(sentence)) {
      score *= 1.25;
    }

    // Penalize sentences that look like article titles or headlines
    if (/:/.test(sentence) && sentence.split(/\s+/).length < 15) {
      score *= 0.2; // Very strong penalty
    }

    // Penalize sentences with excessive capitalization (likely titles/lists)
    const capitalWords = (sentence.match(/\b[A-Z][A-Z]+\b/g) || []).length;
    if (capitalWords > 2) {
      score *= 0.4;
    }

    // Penalize vague/weak opening patterns
    if (/^(A |An |The )?(new|first|second|third|original|official|main|some|many|several)/i.test(sentence) && sentence.length < 100) {
      score *= 0.6;
    }

    // Penalize questions (rarely useful in summaries)
    if (/\?$/.test(sentence)) {
      score *= 0.5;
    }

    // Boost sentences with strong verbs (actions, achievements)
    if (/(established|founded|created|developed|discovered|invented|published|achieved|won|received|became|served)/i.test(sentence)) {
      score *= 1.3;
    }

    // Diversity bonus: penalize sentences with repetitive words
    const uniqueWords = new Set(words);
    const diversityRatio = uniqueWords.size / (words.length || 1);
    if (diversityRatio < 0.5) score *= 0.7; // Repetitive
    if (diversityRatio > 0.8) score *= 1.2; // Diverse vocabulary

    return { sentence, score, index, length: sentence.length };
  });

  // Advanced dynamic sentence selection with anti-redundancy
  const selectedSentences: typeof sentenceScores[0][] = [];
  const selectedSentenceTexts: string[] = [];
  let currentLength = 0;

  // Sort by score
  const sortedSentences = [...sentenceScores].sort((a, b) => b.score - a.score);

  // Select sentences until we reach target length with intelligent redundancy checking
  for (const sentenceData of sortedSentences) {
    if (currentLength >= targetLength) break;

    // Advanced anti-redundancy check using semantic similarity
    if (!isNovelInformation(sentenceData.sentence, selectedSentenceTexts)) {
      continue; // Skip redundant sentences
    }

    // Additional redundancy check: avoid starting with same words
    const isDuplicateStart = selectedSentences.some(selected => {
      const words1 = sentenceData.sentence.toLowerCase().split(/\s+/).slice(0, 5).join(" ");
      const words2 = selected.sentence.toLowerCase().split(/\s+/).slice(0, 5).join(" ");
      return words1 === words2;
    });

    if (isDuplicateStart) continue;

    // Check for topic diversity: avoid clustering too many sentences about exact same thing
    const topicWords = sentenceData.sentence.toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 4)
      .slice(0, 3);

    const hasTopicOverlap = selectedSentences.some(selected => {
      const selectedTopicWords = selected.sentence.toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 4)
        .slice(0, 3);

      const overlap = topicWords.filter(w => selectedTopicWords.includes(w)).length;
      return overlap >= 2 && selectedSentences.indexOf(selected) >= selectedSentences.length - 2;
    });

    if (hasTopicOverlap && selectedSentences.length > 3) continue;

    // Add sentence to selection
    selectedSentences.push(sentenceData);
    selectedSentenceTexts.push(sentenceData.sentence);
    currentLength += sentenceData.length + 2; // +2 for ". "

    // Safety: max 30 sentences for longer articles
    if (selectedSentences.length >= 30) break;
  }

  // Sort by original order to maintain chronological/logical flow
  selectedSentences.sort((a, b) => a.index - b.index);

  // Post-processing: ensure smooth transitions
  const finalSentences = selectedSentences.map(s => s.sentence);

  // Join with proper punctuation
  return finalSentences.join(". ").replace(/\.\s*\./g, ".") + ".";
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return Response.json({ error: "No content provided" }, { status: 400 });
    }

    // Ultra-aggressive text cleaning for perfect summaries
    const cleanText = content
      .replace(/<[^>]*>/g, " ") // Remove HTML tags
      .replace(/\s+/g, " ") // Normalize whitespace

      // Remove all reference patterns
      .replace(/\[[0-9]+\]/g, "") // Remove reference numbers like [1], [2]
      .replace(/\[edit\]/gi, "") // Remove Wikipedia edit markers
      .replace(/\[citation needed\]/gi, "") // Remove citation needed markers
      .replace(/\([0-9,\s]+\)/g, "") // Remove year citations like (2010, 2011)
      .replace(/\(\s*\)/g, "") // Remove empty parentheses
      .replace(/\^[^\s.]*/g, "") // Remove ^ and everything after until space or period
      .replace(/\^/g, "") // Remove any remaining ^

      // Remove quotation marks and normalize apostrophes
      .replace(/"/g, "") // Remove all quotation marks
      .replace(/"/g, "") // Remove smart quotes
      .replace(/"/g, "")
      .replace(/'/g, "'") // Normalize apostrophes
      .replace(/'/g, "'")
      .replace(/'/g, "'")

      // Remove archive/retrieval references
      .replace(/Archived from the original.*?(?=\.|$)/gi, "")
      .replace(/Archived.*?at the Wayback Machine.*?(?=\.|$)/gi, "")
      .replace(/Retrieved.*?(?=\.|$)/gi, "")
      .replace(/Accessed.*?(?=\.|$)/gi, "")
      .replace(/\bon\s+\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/gi, "")

      // Remove bibliographic citations
      .replace(/\(in (Russian|English|French|German|Spanish|Chinese|Arabic|Ukrainian|Polish|Italian|Japanese|Korean|Portuguese|Dutch|Swedish|Norwegian|Danish|Finnish|Turkish|Greek|Hebrew|Hindi|Persian|Vietnamese|Thai)\)/gi, "")
      .replace(/[A-Z][a-z]+,\s+[A-Z][a-z]+\s+\(\d{1,2}\s+\w+\s+\d{4}\)/g, "")
      .replace(/ISBN\s+[\d\-]+/gi, "")
      .replace(/ISSN\s+[\d\-]+/gi, "")
      .replace(/DOI:\s*[\d\.\/]+/gi, "")

      // Remove malformed HTML entities
      .replace(/&lt;/g, "")
      .replace(/&gt;/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "and")
      .replace(/&quot;/g, "")
      .replace(/&mdash;/g, "-")
      .replace(/&ndash;/g, "-")
      .replace(/&hellip;/g, "...")

      // Remove media source mentions
      .replace(/(BBC|CNN|Reuters|AP|AFP|The New York Times|The Guardian|Washington Post|Bloomberg|Forbes|Wall Street Journal|Time Magazine|Newsweek|The Economist)\s+(Russian|English|Arabic|Spanish|French|German)?/gi, "")

      // Remove language prefixes
      .replace(/^(Russian|English|French|German|Spanish|Chinese|Arabic|Japanese|Korean|Italian|Portuguese|Dutch):\s*/gim, "")

      // Remove common Wikipedia section headers and navigation
      .replace(/(Official websites?|External links?|See also|References?|Bibliography|Further reading|Notes|Citations|Sources|Gallery|Images?|Photos?|Videos?|Documentaries|Filmography|Discography|Awards?|Honors?|Publications?):.*$/gim, "")
      .replace(/Jump to:?\s*(navigation|search)/gi, "")
      .replace(/Main article:\s*/gi, "")

      // Remove URLs and email addresses
      .replace(/https?:\/\/[^\s]+/g, "")
      .replace(/www\.[^\s]+/g, "")
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "")

      // Remove file references
      .replace(/\[\[File:.*?\]\]/g, "")
      .replace(/\[\[Image:.*?\]\]/g, "")

      // Clean punctuation
      .replace(/\s*-\s*-\s*/g, " - ")
      .replace(/\s*—\s*/g, " - ")
      .replace(/\s*–\s*/g, " - ")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+\./g, ".")
      .replace(/\.\s*\./g, ".")
      .replace(/\s+,/g, ",")
      .replace(/\s+;/g, ";")
      .replace(/\s+:/g, ":")

      // Remove nonsense words and patterns
      .replace(/\b(abcd|xyz|test|lorem|ipsum|qwerty|asdf|example|placeholder)\b/gi, "")

      // Remove standalone special characters
      .replace(/[<>]\s*\.\s*[<>]/g, "")
      .replace(/\s+[<>]\s+/g, " ")

      // Remove "says", "said", "told" in quotes context (news headlines)
      .replace(/,\s+(says|said|told|according to)\s+[A-Z][a-z]+/g, "")

      // Final cleanup
      .replace(/\s{2,}/g, " ")
      .replace(/\.\s*,/g, ".")
      .trim();

    if (cleanText.length < 300) {
      return Response.json(
        { error: "Article too short to summarize" },
        { status: 400 }
      );
    }

    // Generate comprehensive summary (2000-2500 chars)
    const summary = comprehensiveSummarize(cleanText, 2250);

    if (!summary || summary.length < 500) {
      return Response.json(
        { error: "Could not generate meaningful summary" },
        { status: 500 }
      );
    }

    return Response.json({ summary });
  } catch (error) {
    console.error("Summarization error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
