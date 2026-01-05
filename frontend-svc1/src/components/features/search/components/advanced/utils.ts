/**
 * Search utilities for fuzzy matching and highlighting
 */

/**
 * Simple fuzzy match scorer
 * Returns score 0-1 based on how well query matches text
 */
export function fuzzyMatch(query: string, text: string): number {
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes(lowerQuery)) {
    return 1.0;
  }
  
  let score = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIndex]) {
      score += 1;
      queryIndex++;
    }
  }
  
  return queryIndex === lowerQuery.length ? score / lowerText.length : 0;
}

/**
 * Highlight matching parts of text
 */
export function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) return text;
  
  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);
  
  return `${before}<mark class="bg-yellow-200">${match}</mark>${after}`;
}

/**
 * Filter and score suggestions based on query
 */
export function filterSuggestions<T extends { text: string }>(
  suggestions: T[],
  query: string,
  maxResults: number = 10
): Array<T & { score: number }> {
  if (!query) return [];
  
  return suggestions
    .map(suggestion => ({
      ...suggestion,
      score: fuzzyMatch(query, suggestion.text)
    }))
    .filter(s => s.score > 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}
