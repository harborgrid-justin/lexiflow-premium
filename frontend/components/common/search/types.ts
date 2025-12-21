/**
 * Type definitions for Enhanced Search
 */

export type SearchCategory = 'all' | 'cases' | 'documents' | 'people' | 'dates' | 'tags';

export interface SearchSuggestion {
  id: string;
  text: string;
  category: SearchCategory;
  metadata?: Record<string, unknown>;
  icon?: React.ReactNode;
}

export interface SearchResult extends SearchSuggestion {
  score: number;
  highlightedText?: string;
}

export interface EnhancedSearchProps {
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  onSearch: (query: string, category?: SearchCategory) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  debounceDelay?: number;
  showCategories?: boolean;
  showSyntaxHints?: boolean;
  maxSuggestions?: number;
  autoFocus?: boolean;
  className?: string;
}

export interface SearchState {
  query: string;
  isOpen: boolean;
  selectedIndex: number;
  activeCategory: SearchCategory;
  recentSearches: string[];
}
