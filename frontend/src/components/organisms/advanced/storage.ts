/**
 * Recent searches management utilities
 */

const RECENT_SEARCHES_KEY = "lexiflow_recent_searches";
const MAX_RECENT_SEARCHES = 10;

export function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): void {
  try {
    const recent = getRecentSearches();
    const updated = [query, ...recent.filter((q) => q !== query)].slice(
      0,
      MAX_RECENT_SEARCHES
    );
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (storageError) {
    console.error("Failed to save recent search:", storageError);
  }
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (storageError) {
    console.error("Failed to clear recent searches:", storageError);
  }
}

/**
 * Parse search syntax for advanced filtering
 * Supports: category:value, date:value, tag:value
 */
export function parseSearchSyntax(query: string): {
  text: string;
  filters: Record<string, string>;
} {
  const filters: Record<string, string> = {};
  let text = query;

  const syntaxPattern = /(\w+):(\S+)/g;
  const matches = query.matchAll(syntaxPattern);

  for (const match of matches) {
    if (match.length >= 3) {
      const [full, key, value] = match;
      if (key && value) {
        filters[key] = value;
        text = text.replace(full, "").trim();
      }
    }
  }

  return { text, filters };
}
