import { useTheme } from '@/contexts/theme/ThemeContext';
import { useClickOutside } from '@/hooks/useClickOutside';
import { Command, Search, X } from 'lucide-react';
import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import * as styles from './EnhancedSearch.styles';
import { getCategoryIcon, sanitizeHtml } from './helpers';
import { useKeyboardNav, useSearchHandlers } from './hooks';
import { getRecentSearches, parseSearchSyntax } from './storage';
import type { EnhancedSearchProps, SearchCategory, SearchResult } from './types';
import { filterSuggestions, highlightMatch } from './utils';

/**
 * EnhancedSearch - React 18 optimized with useId
 */
export const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  placeholder = "Search everything...",
  onSearch,
  suggestions = [],
  onSuggestionSelect,
  showCategories = true,
  showSyntaxHints = true,
  autoFocus = false,
  className,
  debounceDelay = 300
}) => {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState<SearchCategory>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Custom hooks for handlers
  const { handleSearch: performSearch, handleSuggestionClick: selectSuggestion } = useSearchHandlers(
    onSearch,
    onSuggestionSelect,
    debounceDelay
  );

  // Filter and highlight suggestions
  const filteredSuggestions = useMemo(() => {
    const categoryFiltered = category === 'all'
      ? suggestions
      : suggestions.filter(s => s.category === category);
    return filterSuggestions(categoryFiltered, deferredQuery, 10);
  }, [suggestions, deferredQuery, category]);

  const displayItems = useMemo(() => {
    if (!deferredQuery) {
      return recentSearches.map(text => ({
        id: `recent-${text}`,
        text,
        category: 'all' as SearchCategory,
        icon: <Search className="h-4 w-4" />,
        score: 1.0
      }));
    }
    return filteredSuggestions.map(item => ({
      ...item,
      highlightedText: highlightMatch(item.text, deferredQuery)
    }));
  }, [deferredQuery, filteredSuggestions, recentSearches]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setSelectedIndex(-1);

    // Parse syntax (e.g., "case:12345")
    const parsed = parseSearchSyntax(value);
    if (parsed.filters.category && parsed.filters.category !== category) {
      setCategory(parsed.filters.category as SearchCategory);
    }

    performSearch(value, category);
  }, [category, performSearch]);

  const handleSuggestionClick = useCallback((suggestion: SearchResult) => {
    selectSuggestion(suggestion, setQuery, setRecentSearches, setIsOpen, setSelectedIndex);
  }, [selectSuggestion]);

  const handleClear = useCallback(() => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useKeyboardNav(
    isOpen,
    displayItems.length,
    () => performSearch(query, category),
    () => {
      const selectedItem = displayItems[selectedIndex];
      if (selectedIndex >= 0 && selectedItem) {
        handleSuggestionClick(selectedItem);
      }
    }
  );

  useClickOutside(containerRef as React.RefObject<HTMLElement>, () => setIsOpen(false));

  return (
    <div ref={containerRef} className={styles.searchContainer(className)}>
      {/* Search Input */}
      <div className={styles.getInputContainer(theme, isOpen)}>
        <Search className={styles.getSearchIcon(theme)} />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={(e) => handleKeyDown(e, selectedIndex, setSelectedIndex, setIsOpen)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={styles.getSearchInput(theme)}
        />

        {query && (
          <button
            onClick={handleClear}
            className={styles.getClearButton(theme)}
            title="Clear"
          >
            <X className={styles.clearIcon} />
          </button>
        )}

        {showSyntaxHints && !query && (
          <div className={styles.syntaxHintsContainer}>
            <Command className={styles.commandIcon} />
            <span>K</span>
          </div>
        )}
      </div>

      {/* Categories */}
      {showCategories && (
        <div className={styles.categoriesContainer}>
          {(['all', 'cases', 'documents', 'people', 'dates', 'tags'] as SearchCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={styles.getCategoryButton(theme, category === cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {isOpen && displayItems.length > 0 && (
        <div
          ref={dropdownRef}
          className={styles.getDropdownContainer(theme)}
        >
          <div className={styles.dropdownScrollContainer}>
            {displayItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => handleSuggestionClick(item)}
                className={styles.getSuggestionButton(theme, selectedIndex === idx)}
              >
                <div className={styles.getSuggestionIcon(theme, selectedIndex === idx)}>
                  {item.icon || getCategoryIcon(item.category)}
                </div>

                <div className={styles.suggestionContentContainer}>
                  <p
                    className={styles.getSuggestionText(theme, selectedIndex === idx)}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(('highlightedText' in item ? item.highlightedText : undefined) || item.text) }}
                  />
                  {'metadata' in item && item.metadata && (
                    <p className={styles.getSuggestionMetadata(theme, selectedIndex === idx)}>
                      {String(item.metadata.description || '')}
                    </p>
                  )}
                </div>

                <span className={styles.getSuggestionCategory(theme, selectedIndex === idx)}>
                  {item.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
