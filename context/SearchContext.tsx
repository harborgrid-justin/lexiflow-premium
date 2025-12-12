/**
 * Search Context
 * Global search state management with history and recent searches
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useMemo } from 'react';
import { useDebounce } from '../hooks/useDebounce';

export type SearchScope = 'all' | 'cases' | 'documents' | 'clients' | 'contacts' | 'tasks' | 'billing';

export interface SearchFilter {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
  value: any;
}

export interface SearchResult {
  id: string;
  type: SearchScope;
  title: string;
  subtitle?: string;
  url: string;
  highlight?: string;
  metadata?: Record<string, any>;
  score?: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  scope: SearchScope;
  timestamp: number;
  resultsCount?: number;
}

interface SearchContextType {
  // Search query state
  query: string;
  debouncedQuery: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;

  // Search scope
  scope: SearchScope;
  setScope: (scope: SearchScope) => void;

  // Search filters
  filters: SearchFilter[];
  addFilter: (filter: SearchFilter) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;
  updateFilter: (field: string, value: any) => void;

  // Search results
  results: SearchResult[];
  setResults: (results: SearchResult[]) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;

  // Search history
  history: SearchHistoryItem[];
  addToHistory: (query: string, scope: SearchScope, resultsCount?: number) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;

  // Recent searches (popular searches)
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // UI state
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;

  // Suggestions
  suggestions: string[];
  setSuggestions: (suggestions: string[]) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearchContext = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
  debounceDelay?: number;
  maxHistoryItems?: number;
  maxRecentSearches?: number;
  persistHistory?: boolean;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({
  children,
  debounceDelay = 300,
  maxHistoryItems = 50,
  maxRecentSearches = 10,
  persistHistory = true,
}) => {
  // Search state
  const [query, setQueryState] = useState('');
  const [scope, setScope] = useState<SearchScope>('all');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // History state
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Debounced query for API calls
  const debouncedQuery = useDebounce(query, debounceDelay);

  // Load history from localStorage on mount
  useEffect(() => {
    if (persistHistory) {
      try {
        const storedHistory = localStorage.getItem('search-history');
        const storedRecent = localStorage.getItem('search-recent');

        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
        if (storedRecent) {
          setRecentSearches(JSON.parse(storedRecent));
        }
      } catch (error) {
        console.error('[SearchContext] Failed to load history from storage:', error);
      }
    }
  }, [persistHistory]);

  // Save history to localStorage when it changes
  useEffect(() => {
    if (persistHistory) {
      try {
        localStorage.setItem('search-history', JSON.stringify(history));
        localStorage.setItem('search-recent', JSON.stringify(recentSearches));
      } catch (error) {
        console.error('[SearchContext] Failed to save history to storage:', error);
      }
    }
  }, [history, recentSearches, persistHistory]);

  // Query management
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    setError(null);
  }, []);

  const clearQuery = useCallback(() => {
    setQueryState('');
    setResults([]);
    setError(null);
  }, []);

  // Filter management
  const addFilter = useCallback((filter: SearchFilter) => {
    setFilters(prev => {
      // Replace existing filter for the same field
      const filtered = prev.filter(f => f.field !== filter.field);
      return [...filtered, filter];
    });
  }, []);

  const removeFilter = useCallback((field: string) => {
    setFilters(prev => prev.filter(f => f.field !== field));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const updateFilter = useCallback((field: string, value: any) => {
    setFilters(prev =>
      prev.map(f => f.field === field ? { ...f, value } : f)
    );
  }, []);

  // History management
  const addToHistory = useCallback((
    searchQuery: string,
    searchScope: SearchScope,
    resultsCount?: number
  ) => {
    if (!searchQuery.trim()) return;

    const historyItem: SearchHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query: searchQuery,
      scope: searchScope,
      timestamp: Date.now(),
      resultsCount,
    };

    setHistory(prev => {
      // Remove duplicates and add new item at the beginning
      const filtered = prev.filter(
        item => item.query.toLowerCase() !== searchQuery.toLowerCase() || item.scope !== searchScope
      );
      const updated = [historyItem, ...filtered];
      return updated.slice(0, maxHistoryItems);
    });
  }, [maxHistoryItems]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  // Recent searches management
  const addRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setRecentSearches(prev => {
      // Remove duplicates and add new item at the beginning
      const filtered = prev.filter(
        item => item.toLowerCase() !== searchQuery.toLowerCase()
      );
      const updated = [searchQuery, ...filtered];
      return updated.slice(0, maxRecentSearches);
    });
  }, [maxRecentSearches]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  // UI management
  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleSearch = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
      // Escape to close search
      if (e.key === 'Escape' && isOpen) {
        closeSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleSearch, closeSearch]);

  const value = useMemo<SearchContextType>(() => ({
    query,
    debouncedQuery,
    setQuery,
    clearQuery,
    scope,
    setScope,
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    updateFilter,
    results,
    setResults,
    isSearching,
    setIsSearching,
    error,
    setError,
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    isOpen,
    openSearch,
    closeSearch,
    toggleSearch,
    suggestions,
    setSuggestions,
  }), [
    query,
    debouncedQuery,
    setQuery,
    clearQuery,
    scope,
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    updateFilter,
    results,
    isSearching,
    error,
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    isOpen,
    openSearch,
    closeSearch,
    toggleSearch,
    suggestions,
  ]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

export default SearchContext;
