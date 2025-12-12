/**
 * useSearch Hook
 * Convenient access to global search state
 */

export { useSearchContext as useSearch } from '../context/SearchContext';
export type {
  SearchScope,
  SearchFilter,
  SearchResult,
  SearchHistoryItem,
} from '../context/SearchContext';
