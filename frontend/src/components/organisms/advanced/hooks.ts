import { useCallback, useRef, useEffect } from 'react';

import { addRecentSearch, getRecentSearches } from './storage';

import type { SearchCategory, SearchResult } from './types';
import type React from 'react';

export function useSearchHandlers(
  onSearch: (query: string, category?: SearchCategory) => void,
  onSuggestionSelect?: (suggestion: SearchResult) => void,
  debounceDelay: number = 300
) {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback((query: string, category: SearchCategory) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const value = query.trim();
    
    if (value) {
      debounceTimerRef.current = setTimeout(() => {
        onSearch(value, category);
      }, debounceDelay);
    }
  }, [onSearch, debounceDelay]);

  const handleSuggestionClick = useCallback((
    suggestion: SearchResult,
    setQuery: (q: string) => void,
    setRecentSearches: (searches: string[]) => void,
    setIsOpen: (open: boolean) => void,
    setSelectedIndex: (index: number) => void
  ) => {
    setQuery(suggestion.text);
    addRecentSearch(suggestion.text);
    setRecentSearches(getRecentSearches());
    onSuggestionSelect?.(suggestion);
    setIsOpen(false);
    setSelectedIndex(-1);
  }, [onSuggestionSelect]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return { handleSearch, handleSuggestionClick };
}

export function useKeyboardNav(
  isOpen: boolean,
  displayItemsLength: number,
  handleSearch: () => void,
  handleSuggestionClick: () => void
) {
  return useCallback((
    e: React.KeyboardEvent,
    selectedIndex: number,
    setSelectedIndex: (index: number) => void,
    setIsOpen: (open: boolean) => void
  ) => {
    if (!isOpen) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(selectedIndex < displayItemsLength - 1 ? selectedIndex + 1 : selectedIndex);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(selectedIndex > -1 ? selectedIndex - 1 : -1);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick();
        } else {
          handleSearch();
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }, [isOpen, displayItemsLength, handleSearch, handleSuggestionClick]);
}
