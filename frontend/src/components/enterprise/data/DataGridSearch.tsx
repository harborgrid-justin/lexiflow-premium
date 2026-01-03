/**
 * @module components/enterprise/data/DataGridSearch
 * @category Enterprise
 * @description Enterprise search component with fuzzy matching, filters, and advanced options.
 *
 * Features:
 * - Fuzzy search across multiple fields
 * - Real-time search with debouncing
 * - Search history
 * - Advanced filter panel
 * - Search suggestions
 * - Keyboard shortcuts
 * - Export search results
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';
import type { ColumnDefinition } from './DataGridColumn';
import { fuzzySearch, type FuzzySearchOptions } from './FuzzySearch';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DataGridSearchProps<T extends Record<string, unknown>> {
  /** Data to search through */
  data: T[];

  /** Columns to search in */
  columns: ColumnDefinition<T>[];

  /** Callback when search results change */
  onSearchResults: (results: T[]) => void;

  /** Search options */
  searchOptions?: FuzzySearchOptions;

  /** Placeholder text */
  placeholder?: string;

  /** Enable search history */
  enableHistory?: boolean;

  /** Maximum history items */
  maxHistoryItems?: number;

  /** Debounce delay in ms */
  debounceDelay?: number;

  /** Show advanced options */
  showAdvancedOptions?: boolean;

  /** Custom className */
  className?: string;

  /** Initial search query */
  initialQuery?: string;
}

interface SearchHistory {
  query: string;
  timestamp: number; // DETERMINISTIC: Will be set in effect, not during render
  resultsCount: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DataGridSearch<T extends Record<string, unknown>>({
  data,
  columns,
  onSearchResults,
  searchOptions: customSearchOptions,
  placeholder = 'Search...',
  enableHistory = true,
  maxHistoryItems = 10,
  debounceDelay = 300,
  showAdvancedOptions = false,
  className,
  initialQuery = '',
}: DataGridSearchProps<T>) {
  const { theme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Defer search query for responsive typing
  const deferredQuery = useDeferredValue(query);

  // Search options state
  const [threshold, setThreshold] = useState(customSearchOptions?.threshold ?? 0.6);
  const [algorithm, setAlgorithm] = useState<'levenshtein' | 'damerau-levenshtein' | 'trigram' | 'combined'>(
    customSearchOptions?.algorithm ?? 'combined'
  );
  const [ignoreCase, setIgnoreCase] = useState(customSearchOptions?.ignoreCase ?? true);
  const [ignoreAccents, setIgnoreAccents] = useState(customSearchOptions?.ignoreAccents ?? true);
  const [usePhonetic, setUsePhonetic] = useState(customSearchOptions?.usePhonetic ?? false);

  // Get searchable fields
  const searchableFields = useMemo(() => {
    return columns
      .filter(col => col.filterable !== false)
      .map(col => col.accessorKey || col.id);
  }, [columns]);

  // Perform search
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery || searchQuery.trim() === '') {
      onSearchResults(data);
      return;
    }

    const searchOptions: FuzzySearchOptions = {
      threshold,
      algorithm,
      ignoreCase,
      ignoreAccents,
      usePhonetic,
      sortByScore: true,
      ...customSearchOptions,
    };

    const results = fuzzySearch(data, searchQuery, searchableFields, searchOptions);
    const items = results.map(r => r.item);

    onSearchResults(items);

    // Add to history
    if (enableHistory && searchQuery.trim()) {
      setSearchHistory(prev => {
        const newHistory = [
          {
            query: searchQuery,
            timestamp: Date.now(),
            resultsCount: items.length,
          },
          ...prev.filter(h => h.query !== searchQuery),
        ].slice(0, maxHistoryItems);

        return newHistory;
      });
    }
  }, [
    data,
    searchableFields,
    threshold,
    algorithm,
    ignoreCase,
    ignoreAccents,
    usePhonetic,
    customSearchOptions,
    onSearchResults,
    enableHistory,
    maxHistoryItems,
  ]);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(query);
    }, debounceDelay);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, performSearch, debounceDelay]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  // Handle clear
  const handleClear = useCallback(() => {
    setQuery('');
    onSearchResults(data);
    inputRef.current?.focus();
  }, [data, onSearchResults]);

  // Handle history item click
  const handleHistoryItemClick = useCallback((historyQuery: string) => {
    setQuery(historyQuery);
    setShowHistory(false);
    inputRef.current?.focus();
  }, []);

  // Handle clear history
  const handleClearHistory = useCallback(() => {
    setSearchHistory([]);
    setShowHistory(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Escape to clear
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClear]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className={cn("flex items-center gap-2 px-4 py-2 rounded-lg border", theme.border.default, theme.surface.default)}>
          {/* Search Icon */}
          <SearchIcon className={cn("flex-shrink-0", theme.text.secondary)} />

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => enableHistory && setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            placeholder={placeholder}
            className={cn(
              "flex-1 bg-transparent outline-none text-sm",
              theme.text.primary,
              "placeholder:text-gray-400"
            )}
          />

          {/* Clear Button */}
          {query && (
            <button
              onClick={handleClear}
              className={cn(
                "flex-shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                theme.text.secondary
              )}
              title="Clear search (Esc)"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}

          {/* Options Toggle */}
          {showAdvancedOptions && (
            <button
              onClick={() => setShowOptions(!showOptions)}
              className={cn(
                "flex-shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                theme.text.secondary,
                showOptions && "bg-gray-100 dark:bg-gray-800"
              )}
              title="Advanced options"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          )}

          {/* Keyboard Hint */}
          <div className={cn("hidden md:flex items-center gap-1 text-xs px-2 py-1 rounded border", theme.border.default, theme.text.tertiary)}>
            <kbd className="font-mono">⌘K</kbd>
          </div>
        </div>

        {/* Search History Dropdown */}
        {enableHistory && showHistory && searchHistory.length > 0 && (
          <div
            className={cn(
              "absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-50 max-h-64 overflow-y-auto",
              theme.surface.default,
              theme.border.default
            )}
          >
            <div className={cn("flex items-center justify-between px-3 py-2 border-b", theme.border.default)}>
              <span className={cn("text-xs font-medium", theme.text.secondary)}>Recent Searches</span>
              <button
                onClick={handleClearHistory}
                className={cn("text-xs", theme.text.secondary, "hover:underline")}
              >
                Clear
              </button>
            </div>

            <div className="py-1">
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryItemClick(item.query)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between",
                    theme.text.primary,
                    "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <ClockIcon className={cn("w-3 h-3", theme.text.tertiary)} />
                    {item.query}
                  </span>
                  <span className={cn("text-xs", theme.text.tertiary)}>
                    {item.resultsCount} results
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Advanced Options Panel */}
      {showAdvancedOptions && showOptions && (
        <div className={cn("p-4 rounded-lg border", theme.border.default, theme.surface.highlight)}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Algorithm */}
            <div className="flex flex-col gap-1">
              <label className={cn("text-xs font-medium", theme.text.secondary)}>
                Algorithm
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as 'levenshtein' | 'damerau-levenshtein' | 'trigram' | 'combined')}
                className={cn(
                  "px-3 py-2 text-sm rounded border",
                  theme.surface.default,
                  theme.border.default,
                  theme.text.primary,
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                )}
              >
                <option value="combined">Combined (Best)</option>
                <option value="levenshtein">Levenshtein</option>
                <option value="damerau-levenshtein">Damerau-Levenshtein</option>
                <option value="trigram">Trigram</option>
              </select>
            </div>

            {/* Threshold */}
            <div className="flex flex-col gap-1">
              <label className={cn("text-xs font-medium", theme.text.secondary)}>
                Threshold: {threshold.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Options */}
            <div className="flex flex-col gap-2">
              <label className={cn("text-xs font-medium", theme.text.secondary)}>
                Options
              </label>
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ignoreCase}
                    onChange={(e) => setIgnoreCase(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className={cn("text-sm", theme.text.primary)}>Ignore case</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ignoreAccents}
                    onChange={(e) => setIgnoreAccents(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className={cn("text-sm", theme.text.primary)}>Ignore accents</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usePhonetic}
                    onChange={(e) => setUsePhonetic(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className={cn("text-sm", theme.text.primary)}>Phonetic matching</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

DataGridSearch.displayName = 'DataGridSearch';

// ============================================================================
// ICONS
// ============================================================================

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-5 h-5", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-4 h-4", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-4 h-4", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-4 h-4", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
