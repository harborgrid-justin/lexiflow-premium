// types/search.ts - Search-related types (moved from API layer)

/**
 * Search result entity returned by search APIs
 * Canonical location: types/search.ts (moved from api/search/search-api.ts)
 */
export interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  highlights?: string[];
  score: number;
  url?: string;
  metadata?: Record<string, never>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Search query parameters
 */
export interface SearchQuery {
  q: string;
  type?: 'all' | 'cases' | 'documents' | 'docket' | 'contacts' | 'tasks';
  filters?: Record<string, any>;
  page?: number;
  limit?: number;
}

/**
 * Search suggestion for autocomplete
 */
export interface SearchSuggestion {
  text: string;
  type: 'query' | 'entity' | 'tag';
  score: number;
  count?: number;
}

/**
 * Search index statistics
 */
export interface SearchStats {
  totalDocuments: number;
  totalIndexed: number;
  lastIndexed?: string;
  indexSize?: string;
}

/**
 * Reindex job result
 */
export interface ReindexResult {
  jobId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  documentsProcessed?: number;
  totalDocuments?: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}
