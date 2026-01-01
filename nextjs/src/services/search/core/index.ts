/**
 * Search Core Module
 * @module services/search/core
 */

export type { SearchResultType, GlobalSearchResult } from './types';
export { validateQuery, validateHistoryTerm } from './validation';
export { hydrateSearchIndex } from './hydration';
export { GlobalSearchEngine } from './engine';
export { saveHistory, getHistory } from './history';
