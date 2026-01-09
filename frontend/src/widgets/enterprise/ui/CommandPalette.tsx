/**
 * @module enterprise/ui/CommandPalette
 * @category Enterprise UI
 * @description Global command palette with quick actions and search (Cmd+K / Ctrl+K)
 *
 * Features:
 * - Global keyboard shortcut (Cmd+K)
 * - Quick actions and commands
 * - Global search across entities
 * - Recent items tracking
 * - Fuzzy search
 * - Keyboard navigation
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart,
  Calendar,
  ChevronRight,
  Clock,
  Command,
  FileText,
  Folder,
  Hash,
  HelpCircle,
  Search,
  Settings,
  Users
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CommandAction {
  id: string;
  label: string;
  description?: string;
  icon?: React.ElementType;
  shortcut?: string[];
  category?: string;
  keywords?: string[];
  onSelect: () => void;
  children?: CommandAction[];
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'case' | 'client' | 'document' | 'contact' | 'task' | 'other';
  icon?: React.ElementType;
  metadata?: Record<string, unknown>;
  onClick: () => void;
}

export interface CommandPaletteProps {
  actions?: CommandAction[];
  onSearch?: (query: string) => Promise<SearchResult[]>;
  placeholder?: string;
  recentItems?: SearchResult[];
  maxRecent?: number;
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const fuzzyMatch = (text: string, query: string): boolean => {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (lowerText.includes(lowerQuery)) return true;

  let queryIndex = 0;
  for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIndex]) {
      queryIndex++;
    }
  }
  return queryIndex === lowerQuery.length;
};

const getIconForType = (type: string): React.ElementType => {
  const iconMap: Record<string, React.ElementType> = {
    case: FileText,
    client: Users,
    document: Folder,
    contact: Users,
    task: Calendar,
    settings: Settings,
    help: HelpCircle,
    analytics: BarChart
  };
  return iconMap[type] || Hash;
};

// ============================================================================
// COMPONENT
// ============================================================================

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  actions = [],
  onSearch,
  placeholder = 'Search or type a command...',
  recentItems = [],
  maxRecent = 5,
  className }) => {
  const { theme } = useTheme();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPath, setCurrentPath] = useState<CommandAction[]>([]);
  const [mounted, setMounted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useEffect(() => {
    setMounted(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      // Escape to close
      if (e.key === 'Escape') {
        if (currentPath.length > 0) {
          setCurrentPath([]);
        } else {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPath]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery('');
      setSearchResults([]);
      setCurrentPath([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // ============================================================================
  // SEARCH LOGIC
  // ============================================================================

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);

      try {
        if (onSearch) {
          const results = await onSearch(query);
          setSearchResults(results);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, onSearch]);

  // ============================================================================
  // FILTERED ACTIONS
  // ============================================================================

  const currentActions = useMemo(() => {
    const actionsToFilter = currentPath.length > 0
      ? currentPath[currentPath.length - 1]!.children || []
      : actions;

    if (!query.trim()) return actionsToFilter;

    return actionsToFilter.filter((action) => {
      const searchText = [
        action.label,
        action.description,
        action.category,
        ...(action.keywords || []),
      ]
        .filter(Boolean)
        .join(' ');

      return fuzzyMatch(searchText, query);
    });
  }, [actions, query, currentPath]);

  // ============================================================================
  // COMBINED ITEMS
  // ============================================================================

  const items = useMemo(() => {
    const results: Array<{
      type: 'action' | 'result' | 'recent';
      data: CommandAction | SearchResult;
    }> = [];

    // Show recent items when no query
    if (!query.trim() && recentItems.length > 0) {
      recentItems.slice(0, maxRecent).forEach((item) => {
        results.push({ type: 'recent', data: item });
      });
    }

    // Add filtered actions
    currentActions.forEach((action) => {
      results.push({ type: 'action', data: action });
    });

    // Add search results
    if (query.trim() && searchResults.length > 0) {
      searchResults.forEach((result) => {
        results.push({ type: 'result', data: result });
      });
    }

    return results;
  }, [query, currentActions, searchResults, recentItems, maxRecent]);

  // ============================================================================
  // ITEM SELECTION
  // ============================================================================

  const handleSelectItem = useCallback((item: typeof items[0]) => {
    if (item.type === 'action') {
      const action = item.data as CommandAction;

      if (action.children && action.children.length > 0) {
        setCurrentPath([...currentPath, action]);
        setQuery('');
        setSelectedIndex(0);
      } else {
        action.onSelect();
        setIsOpen(false);
      }
    } else if (item.type === 'result' || item.type === 'recent') {
      const result = item.data as SearchResult;
      result.onClick();
      setIsOpen(false);
    }
  }, [currentPath, setIsOpen]);

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (items[selectedIndex]) {
            handleSelectItem(items[selectedIndex]);
          }
          break;
        case 'Backspace':
          if (!query && currentPath.length > 0) {
            e.preventDefault();
            setCurrentPath(currentPath.slice(0, -1));
            setSelectedIndex(0);
          }
          break;
      }
    },
    [items, selectedIndex, query, currentPath, handleSelectItem]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!mounted || typeof document === 'undefined') return null;

  const paletteContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn('fixed inset-0 z-50 backdrop-blur-sm', theme.backdrop)}
            onClick={() => setIsOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
            <div
              className={cn(
                'rounded-xl border shadow-2xl overflow-hidden',
                theme.surface.default,
                theme.border.default,
                className
              )}
            >
              {/* Header */}
              <div className={cn('flex items-center gap-3 px-4 py-3 border-b', theme.border.default)}>
                <Search className={cn('h-5 w-5 flex-shrink-0', theme.text.tertiary)} />

                {/* Breadcrumb */}
                {currentPath.length > 0 && (
                  <div className="flex items-center gap-2">
                    {currentPath.map((item, idx) => (
                      <React.Fragment key={item.id}>
                        <button
                          onClick={() => {
                            setCurrentPath(currentPath.slice(0, idx + 1));
                            setQuery('');
                          }}
                          className={cn(
                            'text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400',
                            theme.text.secondary
                          )}
                        >
                          {item.label}
                        </button>
                        <ChevronRight className={cn('h-4 w-4', theme.text.tertiary)} />
                      </React.Fragment>
                    ))}
                  </div>
                )}

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className={cn(
                    'flex-1 bg-transparent outline-none text-base',
                    theme.text.primary,
                    'placeholder:' + theme.text.tertiary
                  )}
                />

                <div className={cn('flex items-center gap-1 text-xs px-2 py-1 rounded border', theme.border.default, theme.text.tertiary)}>
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </div>
              </div>

              {/* Content */}
              <div
                ref={listRef}
                className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700"
              >
                {isSearching ? (
                  <div className={cn('flex items-center justify-center py-12', theme.text.tertiary)}>
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                ) : items.length === 0 ? (
                  <div className={cn('flex flex-col items-center justify-center py-12 px-4', theme.text.tertiary)}>
                    <Search className="h-12 w-12 mb-3 opacity-50" />
                    <p className="text-sm">
                      {query ? 'No results found' : 'Start typing to search...'}
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    {/* Group headers */}
                    {!query && recentItems.length > 0 && items.some((i) => i.type === 'recent') && (
                      <div className={cn('px-3 py-2 text-xs font-semibold flex items-center gap-2', theme.text.tertiary)}>
                        <Clock className="h-3 w-3" />
                        Recent
                      </div>
                    )}

                    {items.map((item, index) => {
                      const isSelected = index === selectedIndex;
                      let Icon: React.ElementType;
                      let label: string;
                      let description: string | undefined;
                      let hasChildren = false;

                      if (item.type === 'action') {
                        const action = item.data as CommandAction;
                        Icon = action.icon || Command;
                        label = action.label;
                        description = action.description;
                        hasChildren = !!action.children?.length;
                      } else {
                        const result = item.data as SearchResult;
                        Icon = result.icon || getIconForType(result.type);
                        label = result.title;
                        description = result.description;
                      }

                      return (
                        <button
                          key={`${item.type}-${item.data.id}-${index}`}
                          onClick={() => handleSelectItem(item)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 transition-colors',
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/30'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          )}
                        >
                          <div
                            className={cn(
                              'flex items-center justify-center h-8 w-8 rounded-lg flex-shrink-0',
                              isSelected
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="flex-1 text-left min-w-0">
                            <div className={cn('text-sm font-medium truncate', theme.text.primary)}>
                              {label}
                            </div>
                            {description && (
                              <div className={cn('text-xs truncate', theme.text.tertiary)}>
                                {description}
                              </div>
                            )}
                          </div>

                          {hasChildren && (
                            <ChevronRight className={cn('h-4 w-4 flex-shrink-0', theme.text.tertiary)} />
                          )}

                          {item.type === 'action' && (item.data as CommandAction).shortcut && (
                            <div className="flex items-center gap-1">
                              {(item.data as CommandAction).shortcut!.map((key, idx) => (
                                <kbd
                                  key={idx}
                                  className={cn(
                                    'px-1.5 py-0.5 text-xs rounded border',
                                    theme.border.default,
                                    theme.text.tertiary
                                  )}
                                >
                                  {key}
                                </kbd>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={cn('flex items-center justify-between px-4 py-2 border-t text-xs', theme.border.default, theme.text.tertiary)}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className={cn('px-1 py-0.5 rounded border', theme.border.default)}>↑</kbd>
                    <kbd className={cn('px-1 py-0.5 rounded border', theme.border.default)}>↓</kbd>
                    <span className="ml-1">Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className={cn('px-1.5 py-0.5 rounded border', theme.border.default)}>↵</kbd>
                    <span className="ml-1">Select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className={cn('px-1.5 py-0.5 rounded border', theme.border.default)}>Esc</kbd>
                    <span className="ml-1">Close</span>
                  </div>
                </div>
                <div>{items.length} results</div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(paletteContent, document.body);
};

CommandPalette.displayName = 'CommandPalette';
export default CommandPalette;
