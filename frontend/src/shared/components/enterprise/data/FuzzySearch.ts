/**
 * @module components/enterprise/data/FuzzySearch
 * @category Enterprise
 * @description Advanced fuzzy search implementation with multiple algorithms and ranking.
 *
 * Features:
 * - Fuzzy string matching with configurable threshold
 * - Levenshtein distance calculation
 * - Damerau-Levenshtein distance (allows transpositions)
 * - Trigram similarity
 * - Weighted multi-field search
 * - Phonetic matching (Soundex, Metaphone)
 * - Search result ranking and scoring
 * - Highlighting of matched portions
 * - Case-insensitive and accent-insensitive options
 *
 * @example
 * ```tsx
 * import { fuzzySearch, createSearchIndex } from './FuzzySearch';
 *
 * const data = [
 *   { id: 1, name: 'John Doe', email: 'john@example.com' },
 *   { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
 * ];
 *
 * const results = fuzzySearch(data, 'jon', ['name', 'email'], {
 *   threshold: 0.6,
 *   sortByScore: true
 * });
 * ```
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FuzzySearchOptions {
  /** Minimum similarity threshold (0-1). Default: 0.6 */
  threshold?: number;

  /** Sort results by score in descending order. Default: true */
  sortByScore?: boolean;

  /** Case-insensitive search. Default: true */
  ignoreCase?: boolean;

  /** Ignore accents/diacritics. Default: true */
  ignoreAccents?: boolean;

  /** Maximum results to return. Default: unlimited */
  limit?: number;

  /** Include score in results. Default: true */
  includeScore?: boolean;

  /** Include matched indices for highlighting. Default: false */
  includeMatches?: boolean;

  /** Search algorithm. Default: 'combined' */
  algorithm?: "levenshtein" | "damerau-levenshtein" | "trigram" | "combined";

  /** Field weights for multi-field search. Default: equal weights */
  fieldWeights?: Record<string, number>;

  /** Enable phonetic matching. Default: false */
  usePhonetic?: boolean;
}

export interface SearchResult<T> {
  item: T;
  score: number;
  matches?: MatchInfo[];
}

export interface MatchInfo {
  field: string;
  indices: [number, number][];
  score: number;
}

export interface SearchIndex<T> {
  data: T[];
  fields: string[];
  normalized: Map<T, Record<string, string>>;
}

// ============================================================================
// MAIN SEARCH FUNCTIONS
// ============================================================================

/**
 * Performs fuzzy search on a dataset
 */
export function fuzzySearch<T extends Record<string, unknown>>(
  data: T[],
  query: string,
  fields: string[],
  options: FuzzySearchOptions = {}
): SearchResult<T>[] {
  const {
    threshold = 0.6,
    sortByScore = true,
    ignoreCase = true,
    ignoreAccents = true,
    limit,
    includeMatches = false,
    algorithm = "combined",
    fieldWeights = {},
    usePhonetic = false,
  } = options;

  if (!query || query.trim() === "") {
    return data.map((item) => ({ item, score: 1, matches: [] }));
  }

  // Normalize query
  const normalizedQuery = normalizeString(query, ignoreCase, ignoreAccents);
  const phoneticQuery = usePhonetic ? soundex(normalizedQuery) : "";

  // Search each item
  const results: SearchResult<T>[] = [];

  for (const item of data) {
    let bestScore = 0;
    const matches: MatchInfo[] = [];

    // Search across all fields
    for (const field of fields) {
      const value = getNestedValue(item, field);
      if (value == null) continue;

      const stringValue = String(value);
      const normalizedValue = normalizeString(
        stringValue,
        ignoreCase,
        ignoreAccents
      );

      // Calculate similarity based on algorithm
      let similarity = 0;

      switch (algorithm) {
        case "levenshtein": {
          similarity = levenshteinSimilarity(normalizedQuery, normalizedValue);
          break;
        }
        case "damerau-levenshtein": {
          similarity = damerauLevenshteinSimilarity(
            normalizedQuery,
            normalizedValue
          );
          break;
        }
        case "trigram": {
          similarity = trigramSimilarity(normalizedQuery, normalizedValue);
          break;
        }
        case "combined":
        default: {
          // Use weighted combination of algorithms
          const lev = levenshteinSimilarity(normalizedQuery, normalizedValue);
          const tri = trigramSimilarity(normalizedQuery, normalizedValue);
          similarity = lev * 0.6 + tri * 0.4;
          break;
        }
      }

      // Apply phonetic matching boost
      if (usePhonetic && phoneticQuery) {
        const phoneticValue = soundex(normalizedValue);
        if (phoneticQuery === phoneticValue) {
          similarity = Math.max(similarity, 0.7); // Phonetic match boosts score
        }
      }

      // Apply field weight
      const weight = fieldWeights[field] || 1;
      const weightedScore = similarity * weight;

      if (weightedScore > bestScore) {
        bestScore = weightedScore;
      }

      // Collect match info
      if (includeMatches && similarity >= threshold) {
        const indices = findMatchIndices(normalizedValue, normalizedQuery);
        matches.push({
          field,
          indices,
          score: similarity,
        });
      }
    }

    // Add to results if above threshold
    if (bestScore >= threshold) {
      results.push({
        item,
        score: bestScore,
        ...(includeMatches && { matches }),
      });
    }
  }

  // Sort by score
  if (sortByScore) {
    results.sort((a, b) => b.score - a.score);
  }

  // Apply limit
  if (limit && limit > 0) {
    return results.slice(0, limit);
  }

  return results;
}

/**
 * Creates a search index for faster repeated searches
 */
export function createSearchIndex<T extends Record<string, unknown>>(
  data: T[],
  fields: string[]
): SearchIndex<T> {
  const normalized = new Map<T, Record<string, string>>();

  for (const item of data) {
    const normalizedFields: Record<string, string> = {};

    for (const field of fields) {
      const value = getNestedValue(item, field);
      if (value != null) {
        normalizedFields[field] = normalizeString(String(value), true, true);
      }
    }

    normalized.set(item, normalizedFields);
  }

  return { data, fields, normalized };
}

/**
 * Searches using a pre-built index
 */
export function searchIndex<T extends Record<string, unknown>>(
  index: SearchIndex<T>,
  query: string,
  options: FuzzySearchOptions = {}
): SearchResult<T>[] {
  const {
    threshold = 0.6,
    sortByScore = true,
    limit,
    algorithm = "combined",
    fieldWeights = {},
  } = options;

  const normalizedQuery = normalizeString(query, true, true);
  const results: SearchResult<T>[] = [];

  for (const [item, normalizedFields] of index.normalized) {
    let bestScore = 0;

    for (const field of index.fields) {
      const normalizedValue = normalizedFields[field];
      if (!normalizedValue) continue;

      let similarity = 0;

      switch (algorithm) {
        case "levenshtein": {
          similarity = levenshteinSimilarity(normalizedQuery, normalizedValue);
          break;
        }
        case "damerau-levenshtein": {
          similarity = damerauLevenshteinSimilarity(
            normalizedQuery,
            normalizedValue
          );
          break;
        }
        case "trigram": {
          similarity = trigramSimilarity(normalizedQuery, normalizedValue);
          break;
        }
        case "combined":
        default: {
          const lev = levenshteinSimilarity(normalizedQuery, normalizedValue);
          const tri = trigramSimilarity(normalizedQuery, normalizedValue);
          similarity = lev * 0.6 + tri * 0.4;
          break;
        }
      }

      const weight = fieldWeights[field] || 1;
      const weightedScore = similarity * weight;

      if (weightedScore > bestScore) {
        bestScore = weightedScore;
      }
    }

    if (bestScore >= threshold) {
      results.push({ item, score: bestScore });
    }
  }

  if (sortByScore) {
    results.sort((a, b) => b.score - a.score);
  }

  if (limit && limit > 0) {
    return results.slice(0, limit);
  }

  return results;
}

// ============================================================================
// SIMILARITY ALGORITHMS
// ============================================================================

/**
 * Calculates Levenshtein distance between two strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Create matrix
  const matrix: number[][] = Array.from({ length: len1 + 1 }, () =>
    Array(len2 + 1).fill(0)
  );

  // Initialize first column and row
  for (let i = 0; i <= len1; i++) matrix[i]![0] = i;
  for (let j = 0; j <= len2; j++) matrix[0]![j] = j;

  // Calculate distances
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        (matrix[i - 1]?.[j] ?? 0) + 1, // deletion
        (matrix[i]?.[j - 1] ?? 0) + 1, // insertion
        (matrix[i - 1]?.[j - 1] ?? 0) + cost // substitution
      );
    }
  }

  return matrix[len1]![len2]!;
}

/**
 * Converts Levenshtein distance to similarity score (0-1)
 */
export function levenshteinSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;

  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);

  return 1 - distance / maxLength;
}

/**
 * Calculates Damerau-Levenshtein distance (allows transpositions)
 */
export function damerauLevenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const maxDist = len1 + len2;

  const matrix: number[][] = Array.from({ length: len1 + 2 }, () =>
    Array(len2 + 2).fill(0)
  );

  matrix[0]![0] = maxDist;
  for (let i = 0; i <= len1; i++) {
    matrix[i + 1]![0] = maxDist;
    matrix[i + 1]![1] = i;
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0]![j + 1] = maxDist;
    matrix[1]![j + 1] = j;
  }

  const charMap: Record<string, number> = {};

  for (let i = 1; i <= len1; i++) {
    let db = 0;
    for (let j = 1; j <= len2; j++) {
      const k = charMap[str2[j - 1]!] || 0;
      const l = db;
      let cost = 1;

      if (str1[i - 1] === str2[j - 1]) {
        cost = 0;
        db = j;
      }

      matrix[i + 1]![j + 1] = Math.min(
        (matrix[i]?.[j] ?? 0) + cost, // substitution
        (matrix[i + 1]?.[j] ?? 0) + 1, // insertion
        (matrix[i]?.[j + 1] ?? 0) + 1, // deletion
        (matrix[k]?.[l] || 0) + (i - k - 1) + 1 + (j - l - 1) // transposition
      );
    }
    charMap[str1[i - 1]!] = i;
  }

  return matrix[len1 + 1]![len2 + 1]!;
}

/**
 * Converts Damerau-Levenshtein distance to similarity score
 */
export function damerauLevenshteinSimilarity(
  str1: string,
  str2: string
): number {
  if (str1 === str2) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;

  const distance = damerauLevenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);

  return 1 - distance / maxLength;
}

/**
 * Calculates trigram similarity between two strings
 */
export function trigramSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;

  const trigrams1 = getTrigrams(str1);
  const trigrams2 = getTrigrams(str2);

  if (trigrams1.length === 0 && trigrams2.length === 0) return 1;
  if (trigrams1.length === 0 || trigrams2.length === 0) return 0;

  // Calculate Jaccard similarity
  const set1 = new Set(trigrams1);
  const set2 = new Set(trigrams2);
  const intersection = new Set([...set1].filter((x) => set2.has(x)));

  return intersection.size / (set1.size + set2.size - intersection.size);
}

/**
 * Extracts trigrams from a string
 */
function getTrigrams(str: string): string[] {
  const padded = "  " + str + "  ";
  const trigrams: string[] = [];

  for (let i = 0; i < padded.length - 2; i++) {
    trigrams.push(padded.substring(i, i + 3));
  }

  return trigrams;
}

// ============================================================================
// PHONETIC ALGORITHMS
// ============================================================================

/**
 * Simplified Soundex algorithm for phonetic matching
 */
export function soundex(str: string): string {
  if (!str) return "";

  const normalized = str.toUpperCase().replace(/[^A-Z]/g, "");
  if (normalized.length === 0) return "";

  const codes: Record<string, string> = {
    B: "1",
    F: "1",
    P: "1",
    V: "1",
    C: "2",
    G: "2",
    J: "2",
    K: "2",
    Q: "2",
    S: "2",
    X: "2",
    Z: "2",
    D: "3",
    T: "3",
    L: "4",
    M: "5",
    N: "5",
    R: "6",
  };

  let soundexCode = normalized[0]!;
  let prevCode = codes[normalized[0]!] || "";

  for (let i = 1; i < normalized.length && soundexCode.length < 4; i++) {
    const char = normalized[i]!;
    const code = codes[char] || "";

    if (code && code !== prevCode) {
      soundexCode += code;
      prevCode = code;
    } else if (!code) {
      prevCode = "";
    }
  }

  return soundexCode.padEnd(4, "0");
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalizes a string for searching
 */
function normalizeString(
  str: string,
  ignoreCase: boolean = true,
  ignoreAccents: boolean = true
): string {
  let normalized = str;

  if (ignoreCase) {
    normalized = normalized.toLowerCase();
  }

  if (ignoreAccents) {
    normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  return normalized.trim();
}

/**
 * Gets nested value from object using dot notation
 */
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce((acc: unknown, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

/**
 * Finds all match indices in a string
 */
function findMatchIndices(text: string, query: string): [number, number][] {
  const indices: [number, number][] = [];

  if (!query || !text) return indices;

  // Find exact substring matches
  let index = text.indexOf(query);
  while (index !== -1) {
    indices.push([index, index + query.length]);
    index = text.indexOf(query, index + 1);
  }

  // If no exact matches, find partial matches
  if (indices.length === 0) {
    const queryChars = query.split("");
    let currentStart = -1;
    let currentEnd = -1;

    for (let i = 0; i < text.length; i++) {
      if (queryChars.some((char) => text[i] === char)) {
        if (currentStart === -1) {
          currentStart = i;
        }
        currentEnd = i;
      } else if (currentStart !== -1) {
        indices.push([currentStart, currentEnd + 1]);
        currentStart = -1;
        currentEnd = -1;
      }
    }

    if (currentStart !== -1) {
      indices.push([currentStart, currentEnd + 1]);
    }
  }

  return indices;
}

/**
 * Highlights matched portions in text
 */
export function highlightMatches(
  text: string,
  matches: [number, number][],
  highlightClass: string = "highlight"
): string {
  if (!matches || matches.length === 0) return text;

  let result = "";
  let lastIndex = 0;

  for (const [start, end] of matches) {
    result += text.substring(lastIndex, start);
    result += `<span class="${highlightClass}">${text.substring(start, end)}</span>`;
    lastIndex = end;
  }

  result += text.substring(lastIndex);
  return result;
}
