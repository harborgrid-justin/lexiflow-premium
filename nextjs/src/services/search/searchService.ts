"use client";

/**
 * Global Search Service - Multi-domain full-text search with Web Worker
 * @module services/search/searchService
 *
 * Next.js 16: Client-only (uses Worker, localStorage for history)
 *
 * Features:
 * - Web Worker-based full-text search (off-thread indexing)
 * - Multi-domain search (10 domains)
 * - Automatic data hydration from DataService
 * - Search history persistence
 *
 * @example
 * const results = await SearchService.search('contract dispute');
 * SearchService.saveHistory('contract dispute');
 * const history = SearchService.getHistory();
 */

import type { GlobalSearchResult } from "./core";
import { getHistory, GlobalSearchEngine, saveHistory } from "./core";

export type { GlobalSearchResult, SearchResultType } from "./core";

// Singleton search engine instance
const engine = new GlobalSearchEngine();

/** SearchService - Public API for global search operations */
export const SearchService = {
  /** Search across all domains */
  search: (query: string): Promise<GlobalSearchResult[]> =>
    engine.search(query),

  /** Save search term to history - maintains last 10 unique searches */
  saveHistory,

  /** Get search history - returns up to 10 most recent searches */
  getHistory,

  /** Check if search index is ready */
  isReady: (): boolean => engine.isReady(),
};
