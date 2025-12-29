/**
 * @module components/navigation/CommandPalette/fuzzySearch
 * @category Navigation - Utils
 * @description Enhanced fuzzy search algorithm with scoring and highlighting
 */

/**
 * Match result with score and match indices
 */
export interface FuzzyMatchResult {
  /** Whether the search matches */
  matches: boolean;
  /** Match score (0-100, higher is better) */
  score: number;
  /** Indices of matched characters */
  matchIndices: number[];
}

/**
 * Highlighted segment for rendering
 */
export interface HighlightSegment {
  /** Segment text */
  text: string;
  /** Whether segment is highlighted */
  isHighlight: boolean;
}

/**
 * Enhanced fuzzy match with scoring and match tracking
 * Implements a character-by-character matching algorithm that:
 * - Matches characters in order (non-contiguous)
 * - Scores based on match positions and patterns
 * - Tracks match indices for highlighting
 *
 * @param text - Text to search in
 * @param query - Search query
 * @returns Match result with score and indices
 */
export function fuzzyMatch(text: string, query: string): FuzzyMatchResult {
  if (!query) {
    return { matches: true, score: 0, matchIndices: [] };
  }

  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  // Quick reject if query is longer than text
  if (queryLower.length > textLower.length) {
    return { matches: false, score: 0, matchIndices: [] };
  }

  const matchIndices: number[] = [];
  let textIndex = 0;
  let queryIndex = 0;
  let score = 0;
  let consecutiveMatches = 0;

  // Character-by-character matching
  while (textIndex < textLower.length && queryIndex < queryLower.length) {
    if (textLower[textIndex] === queryLower[queryIndex]) {
      matchIndices.push(textIndex);

      // Scoring factors:
      // 1. Character at start of text or word = higher score
      const isWordStart = textIndex === 0 || /[\s_-]/.test(textLower[textIndex - 1]);
      if (isWordStart) {
        score += 10;
      }

      // 2. Consecutive matches = higher score
      if (consecutiveMatches > 0) {
        score += 5 + consecutiveMatches;
      }
      consecutiveMatches++;

      // 3. Case-sensitive match = bonus
      if (text[textIndex] === query[queryIndex]) {
        score += 2;
      }

      // 4. Early matches = higher score
      score += Math.max(0, 10 - textIndex);

      queryIndex++;
    } else {
      consecutiveMatches = 0;
    }
    textIndex++;
  }

  const matches = queryIndex === queryLower.length;

  if (!matches) {
    return { matches: false, score: 0, matchIndices: [] };
  }

  // Normalize score to 0-100 range
  const maxPossibleScore = queryLower.length * 30; // Approximate max score
  const normalizedScore = Math.min(100, Math.round((score / maxPossibleScore) * 100));

  return {
    matches,
    score: normalizedScore,
    matchIndices,
  };
}

/**
 * Score a search result based on multiple factors
 * @param text - Text to score
 * @param query - Search query
 * @param keywords - Additional keywords to match
 * @returns Score (0-100)
 */
export function scoreMatch(
  text: string,
  query: string,
  keywords: string[] = [],
): number {
  if (!query) return 0;

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  // Exact match = highest score
  if (textLower === queryLower) {
    return 100;
  }

  // Starts with query = very high score
  if (textLower.startsWith(queryLower)) {
    return 95;
  }

  // Contains query as whole word = high score
  const wordBoundaryRegex = new RegExp(`\\b${escapeRegex(queryLower)}\\b`, 'i');
  if (wordBoundaryRegex.test(textLower)) {
    return 85;
  }

  // Contains query = good score
  if (textLower.includes(queryLower)) {
    return 75;
  }

  // Check keywords
  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    if (keywordLower === queryLower) return 80;
    if (keywordLower.startsWith(queryLower)) return 70;
    if (keywordLower.includes(queryLower)) return 60;
  }

  // Fuzzy match = lower score
  const fuzzyResult = fuzzyMatch(textLower, queryLower);
  if (fuzzyResult.matches) {
    return Math.max(fuzzyResult.score, 40);
  }

  return 0;
}

/**
 * Get highlighted segments for rendering
 * @param text - Text to highlight
 * @param matchIndices - Indices of matched characters
 * @returns Array of segments with highlight flags
 */
export function getHighlightSegments(
  text: string,
  matchIndices: number[],
): HighlightSegment[] {
  if (matchIndices.length === 0) {
    return [{ text, isHighlight: false }];
  }

  const segments: HighlightSegment[] = [];
  let lastIndex = 0;

  // Sort indices to ensure they're in order
  const sortedIndices = [...matchIndices].sort((a, b) => a - b);

  // Group consecutive indices
  const groups: number[][] = [];
  let currentGroup: number[] = [sortedIndices[0]];

  for (let i = 1; i < sortedIndices.length; i++) {
    if (sortedIndices[i] === sortedIndices[i - 1] + 1) {
      currentGroup.push(sortedIndices[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [sortedIndices[i]];
    }
  }
  groups.push(currentGroup);

  // Create segments
  for (const group of groups) {
    const start = group[0];
    const end = group[group.length - 1] + 1;

    // Add non-highlighted segment before this group
    if (start > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, start),
        isHighlight: false,
      });
    }

    // Add highlighted segment
    segments.push({
      text: text.slice(start, end),
      isHighlight: true,
    });

    lastIndex = end;
  }

  // Add remaining non-highlighted text
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isHighlight: false,
    });
  }

  return segments;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Filter and sort items by fuzzy match
 * @param items - Items to filter
 * @param query - Search query
 * @param getText - Function to extract text from item
 * @param getKeywords - Function to extract keywords from item
 * @returns Filtered and sorted items
 */
export function fuzzyFilter<T>(
  items: T[],
  query: string,
  getText: (item: T) => string,
  getKeywords?: (item: T) => string[],
): T[] {
  if (!query) return items;

  return items
    .map((item) => ({
      item,
      score: scoreMatch(
        getText(item),
        query,
        getKeywords ? getKeywords(item) : [],
      ),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}
