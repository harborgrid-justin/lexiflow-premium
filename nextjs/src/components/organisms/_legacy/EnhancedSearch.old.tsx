/**
 * @module components/common/EnhancedSearch
 * @category Common
 * @description Context-aware search with autocomplete, fuzzy matching, and keyboard navigation.
 * 
 * FEATURES:
 * - Real-time suggestions from recent searches and entities
 * - Fuzzy matching for typo tolerance
 * - Category-based filtering
 * - Keyboard navigation
 * - Search syntax support
 * - Highlighted matching text
 * - Recent searches history
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, Clock, X, Command, TrendingUp, Hash, Calendar, Tag } from 'lucide-react';
import { useTheme } from '@/providers';
import { useClickOutside } from '@/hooks/useClickOutside';
import { cn } from '@/utils/cn';
import { sanitizeHtml } from '@/utils/sanitize';
import { SEARCH_DEBOUNCE_MS } from '@/config/master.config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

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
  /** Placeholder text */
  placeholder?: string;
  /** Available suggestions */
  suggestions?: SearchSuggestion[];
  /** Search handler */
  onSearch: (query: string, category?: SearchCategory) => void;
  /** Suggestion select handler */
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  /** Debounce delay in milliseconds */
  debounceDelay?: number;
  /** Show category filters */
  showCategories?: boolean;
  /** Enable search syntax hints */
  showSyntaxHints?: boolean;
  /** Maximum suggestions to show */
  maxSuggestions?: number;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Custom className */
  className?: string;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Simple fuzzy match scorer
 * Returns score 0-1 based on how well query matches text
 */
function fuzzyMatch(query: string, text: string): number {
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();
  
  // Exact match
  if (lowerText.includes(lowerQuery)) {
    return 1.0;
  }
  
  // Character-by-character match
  let score = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIndex]) {
      score += 1;
      queryIndex++;
    }
  }
  
  return queryIndex === lowerQuery.length ? score / lowerText.length : 0;
}

/**
 * Highlight matching parts of text
 */
function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Parse search syntax (e.g., "case:123", "date:2024-01")
 */
function parseSearchSyntax(query: string): { 
  text: string;
  filters: Record<string, string>;
} {
  const filters: Record<string, string> = {};
  let text = query;
  
  const syntaxRegex = /(\w+):([^\s]+)/g;
  const matches = Array.from(query.matchAll(syntaxRegex));
  
  matches.forEach(match => {
    const [full, key, value] = match;
    filters[key] = value;
    text = text.replace(full, '').trim();
  });
  
  return { text, filters };
}

/**
 * Get category icon
 */
function getCategoryIcon(category: SearchCategory): React.ReactNode {
  switch (category) {
    case 'cases':
      return <Hash className="h-4 w-4" />;
    case 'documents':
      return <TrendingUp className="h-4 w-4" />;
    case 'people':
      return <Search className="h-4 w-4" />;
    case 'dates':
      return <Calendar className="h-4 w-4" />;
    case 'tags':
      return <Tag className="h-4 w-4" />;
    default:
      return <Search className="h-4 w-4" />;
  }
}

// ============================================================================
// LOCAL STORAGE
// ============================================================================

const RECENT_SEARCHES_KEY = 'lexiflow_recent_searches';
const MAX_RECENT_SEARCHES = 10;

function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

function addRecentSearch(query: string): void {
  try {
    const recent = getRecentSearches();
    const updated = [query, ...recent.filter(q => q !== query)].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    // Ignore localStorage errors
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  placeholder = 'Search...',
  suggestions = [],
  onSearch,
  onSuggestionSelect,
  debounceDelay = SEARCH_DEBOUNCE_MS,
  showCategories = true,
  showSyntaxHints = true,
  maxSuggestions = 8,
  autoFocus = false,
  className,
}) => {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Filter and score suggestions
  const filteredSuggestions = useMemo(() => {
    if (!query) return [];

    const { text } = parseSearchSyntax(query);
    
    const results = suggestions
      .map(suggestion => {
        // Category filter
        if (category !== 'all' && suggestion.category !== category) {
          return null;
        }
        
        // Fuzzy match
        const score = fuzzyMatch(text, suggestion.text);
        if (score === 0) return null;
        
        return {
          ...suggestion,
          score,
          highlightedText: highlightMatch(suggestion.text, text),
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => ((b as { score?: number })?.score || 0) - ((a as { score?: number })?.score || 0))
      .slice(0, maxSuggestions);
    
    return results;
  }, [query, suggestions, category, maxSuggestions]);

  // Show suggestions or recent searches
  const displayItems = useMemo(() => {
    if (query) {
      return filteredSuggestions;
    }
    
    // Show recent searches when input is empty
    return recentSearches.map((search, idx) => ({
      id: `recent-${idx}`,
      text: search,
      category: 'all' as SearchCategory,
      icon: <Clock className="h-4 w-4" />,
      score: 0,
    }));
  }, [query, filteredSuggestions, recentSearches]);

  /**
   * Handle search submission
   */
  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    
    addRecentSearch(query);
    setRecentSearches(getRecentSearches());
    onSearch(query, category);
    setIsOpen(false);
    setSelectedIndex(-1);
  }, [query, category, onSearch]);

  /**
   * Handle input change with debouncing
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setIsOpen(true);
    
    // Debounced search
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    if (value.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        onSearch(value, category);
      }, debounceDelay);
    }
  }, [category, onSearch, debounceDelay]);

  /**
   * Handle suggestion selection
   */
  const handleSuggestionClick = useCallback((suggestion: SearchResult) => {
    setQuery(suggestion.text);
    addRecentSearch(suggestion.text);
    setRecentSearches(getRecentSearches());
    onSuggestionSelect?.(suggestion);
    setIsOpen(false);
    setSelectedIndex(-1);
  }, [onSuggestionSelect]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < displayItems.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && displayItems[selectedIndex]) {
          handleSuggestionClick(displayItems[selectedIndex]);
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
  }, [isOpen, selectedIndex, displayItems, handleSearch, handleSuggestionClick]);

  /**
   * Clear query
   */
  const handleClear = useCallback(() => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  // Close dropdown when clicking outside
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
          onKeyDown={handleKeyDown}
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
          
          {/* Syntax Hints Footer */}
          {showSyntaxHints && query && (
            <div className={cn(
              "px-3 py-2 border-t text-xs",
              theme.surface.highlight,
              theme.border.default,
              theme.text.tertiary
            )}>
              <span className="font-medium">Tip:</span> Try{' '}
              <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700">
                case:123
              </code>,{' '}
              <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700">
                date:2024-01
              </code>, or{' '}
              <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700">
                tag:urgent
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;
