/**
 * Search Service Types
 * @module services/search/core/types
 */

/** Search result type discriminator */
export type SearchResultType =
  | 'case'
  | 'document'
  | 'client'
  | 'task'
  | 'evidence'
  | 'user'
  | 'docket'
  | 'motion'
  | 'clause'
  | 'rule';

/** Normalized search result */
export interface GlobalSearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  data: unknown;
  score?: number;
}
