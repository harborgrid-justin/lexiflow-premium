import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Search, X, Command } from 'lucide-react';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import type { SearchCategory, SearchResult, EnhancedSearchProps } from './types';
import { highlightMatch, filterSuggestions } from './utils';
import { getRecentSearches, parseSearchSyntax } from './storage';
import { useSearchHandlers, useKeyboardNav } from './hooks';
import { getCategoryIcon, sanitizeHtml } from './helpers';

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
    return filterSuggestions(categoryFiltered, query, 10);
  }, [suggestions, query, category]);

  const displayItems = useMemo(() => {
    if (!query) {
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
      highlightedText: highlightMatch(item.text, query)
    }));
  }, [query, filteredSuggestions, recentSearches]);

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
    () => selectedIndex >= 0 && handleSuggestionClick(displayItems[selectedIndex])
  );

  useClickOutside(containerRef as React.RefObject<HTMLElement>, () => setIsOpen(false));

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
        theme.surface.input,
        theme.border.default,
        isOpen && theme.border.focused,
        "focus-within:ring-2 focus-within:ring-offset-0 focus-within:ring-blue-500"
      )}>
        <Search className={cn("h-4 w-4 flex-shrink-0", theme.text.tertiary)} />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={(e) => handleKeyDown(e, selectedIndex, setSelectedIndex, setIsOpen)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            "flex-1 bg-transparent outline-none text-sm",
            theme.text.primary,
            "placeholder:text-slate-400 dark:placeholder:text-slate-600"
          )}
        />
        
        {query && (
          <button
            onClick={handleClear}
            className={cn(
              "p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors",
              theme.text.tertiary
            )}
            title="Clear"
          >
            <X className="h-3 w-3" />
          </button>
        )}
        
        {showSyntaxHints && !query && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        )}
      </div>

      {/* Categories */}
      {showCategories && (
        <div className="flex items-center gap-1 mt-2">
          {(['all', 'cases', 'documents', 'people', 'dates', 'tags'] as SearchCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-2 py-1 text-xs font-medium rounded transition-colors capitalize",
                category === cat
                  ? cn(theme.primary.DEFAULT, 'text-white')
                  : cn(theme.surface.input, theme.text.secondary, "hover:bg-slate-200 dark:hover:bg-slate-700")
              )}
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
          className={cn(
            "absolute z-50 w-full mt-2 rounded-lg border shadow-lg overflow-hidden",
            theme.surface.default,
            theme.border.default
          )}
        >
          <div className="max-h-96 overflow-y-auto">
            {displayItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => handleSuggestionClick(item)}
                className={cn(
                  "w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors",
                  selectedIndex === idx
                    ? cn(theme.primary.light, theme.primary.text)
                    : cn(theme.surface.default, "hover:bg-slate-100 dark:hover:bg-slate-800")
                )}
              >
                <div className={cn(
                  "flex-shrink-0",
                  selectedIndex === idx ? theme.primary.text : theme.text.tertiary
                )}>
                  {item.icon || getCategoryIcon(item.category)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm truncate",
                      selectedIndex === idx ? theme.primary.text : theme.text.primary
                    )}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(('highlightedText' in item ? item.highlightedText : undefined) || item.text) }}
                  />
                  {'metadata' in item && item.metadata && (
                    <p className={cn(
                      "text-xs mt-0.5",
                      selectedIndex === idx ? theme.primary.text : theme.text.tertiary
                    )}>
                      {String(item.metadata.description || '')}
                    </p>
                  )}
                </div>
                
                <span className={cn(
                  "text-xs capitalize flex-shrink-0",
                  selectedIndex === idx ? theme.primary.text : theme.text.tertiary
                )}>
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
