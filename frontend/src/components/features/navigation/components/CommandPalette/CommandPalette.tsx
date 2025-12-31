/**
 * @module components/navigation/CommandPalette
 * @category Navigation
 * @description Enhanced command palette with Cmd+K keyboard shortcut, fuzzy search,
 * recent commands, and AI-powered intent detection. Provides rapid navigation and
 * command execution across the entire application.
 *
 * THEME SYSTEM USAGE:
 * - theme.surface.default - Palette background
 * - theme.text.primary/secondary - Text colors
 * - theme.border.default - Borders
 * - theme.surface.highlight - Selected item
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Command,
  Search,
  Sparkles,
  Clock,
  X,
  CornerDownLeft,
  ArrowRight
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useListNavigation } from '@/hooks/useListNavigation';

// Utils & Constants
import { cn } from '@/utils/cn';
import * as styles from './CommandPalette.styles';

// Types
import type { UserRole } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Command item category
 */
export type CommandCategory =
  | 'navigation'
  | 'action'
  | 'search'
  | 'recent'
  | 'ai';

/**
 * Represents a single command in the palette
 */
export interface CommandItem {
  /** Unique identifier */
  id: string;
  /** Command label */
  label: string;
  /** Command description */
  description?: string;
  /** Command category */
  category: CommandCategory;
  /** Command icon */
  icon?: LucideIcon;
  /** Keywords for searching */
  keywords?: string[];
  /** Keyboard shortcut */
  shortcut?: string;
  /** Roles that can access this command */
  allowedRoles?: UserRole[];
  /** Execute handler */
  onExecute: () => void;
  /** Badge text */
  badge?: string;
}

/**
 * Command group for organization
 */
export interface CommandGroup {
  /** Group identifier */
  id: string;
  /** Group label */
  label: string;
  /** Commands in this group */
  commands: CommandItem[];
}

export interface CommandPaletteProps {
  /** Available commands */
  commands: CommandItem[];
  /** Current user's role for filtering */
  currentUserRole?: UserRole;
  /** Whether palette is open */
  isOpen: boolean;
  /** Open/close handler */
  onOpenChange: (open: boolean) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Maximum recent commands to show */
  maxRecentCommands?: number;
  /** Custom className */
  className?: string;
  /** Enable AI-powered suggestions */
  enableAI?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fuzzy search matcher
 */
const fuzzyMatch = (text: string, query: string): boolean => {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  let queryIndex = 0;
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++;
    }
  }

  return queryIndex === queryLower.length;
};

/**
 * Score command relevance
 */
const scoreCommand = (command: CommandItem, query: string): number => {
  if (!query) return 0;

  const queryLower = query.toLowerCase();
  const labelLower = command.label.toLowerCase();

  // Exact match gets highest score
  if (labelLower === queryLower) return 100;

  // Starts with query gets high score
  if (labelLower.startsWith(queryLower)) return 90;

  // Contains query gets medium score
  if (labelLower.includes(queryLower)) return 70;

  // Check keywords
  if (command.keywords) {
    for (const keyword of command.keywords) {
      if (keyword.toLowerCase().includes(queryLower)) return 60;
    }
  }

  // Fuzzy match gets low score
  if (fuzzyMatch(labelLower, queryLower)) return 40;

  return 0;
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CommandPalette - Enhanced command palette with Cmd+K support
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  commands,
  currentUserRole,
  isOpen,
  onOpenChange,
  placeholder = 'Type a command or search...',
  maxRecentCommands = 5,
  className,
  enableAI = true,
}) => {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 150);

  // Memoization with purpose: Role filtering is expensive for large command lists (Principle #13)
  const visibleCommands = React.useMemo(() => {
    return commands.filter(command => {
      if (!command.allowedRoles || command.allowedRoles.length === 0) {
        return true;
      }
      if (!currentUserRole) {
        return false;
      }
      return command.allowedRoles.includes(currentUserRole);
    });
  }, [commands, currentUserRole]);

  // Filter and score commands based on query
  const filteredCommands = React.useMemo(() => {
    if (!debouncedQuery) {
      // Show recent commands when no query
      const recent = visibleCommands.filter(cmd =>
        recentCommands.includes(cmd.id)
      );
      return recent.slice(0, maxRecentCommands);
    }

    return visibleCommands
      .map(command => ({
        command,
        score: scoreCommand(command, debouncedQuery),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ command }) => command)
      .slice(0, 20);
  }, [visibleCommands, debouncedQuery, recentCommands, maxRecentCommands]);

  // Group commands by category
  const groupedCommands = React.useMemo(() => {
    const groups: Record<CommandCategory, CommandItem[]> = {
      navigation: [],
      action: [],
      search: [],
      recent: [],
      ai: [],
    };

    filteredCommands.forEach(command => {
      // If no query, mark as recent
      if (!debouncedQuery && recentCommands.includes(command.id)) {
        groups.recent.push(command);
      } else {
        groups[command.category].push(command);
      }
    });

    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .map(([category, items]) => ({
        id: category,
        label: getCategoryLabel(category as CommandCategory),
        commands: items,
      }));
  }, [filteredCommands, debouncedQuery, recentCommands]);

  // Flatten commands for navigation
  const flatCommands = groupedCommands.flatMap(group => group.commands);

  /**
   * Handle command execution
   */
  const handleCommandExecute = useCallback((command: CommandItem) => {
    command.onExecute();

    // Add to recent commands
    setRecentCommands(prev => {
      const updated = [command.id, ...prev.filter(id => id !== command.id)];
      return updated.slice(0, maxRecentCommands);
    });

    onOpenChange(false);
  }, [maxRecentCommands, onOpenChange]);

  // Keyboard navigation
  const { focusedIndex, handleKeyDown, setFocusedIndex } = useListNavigation({
    items: flatCommands,
    mode: 'simple',
    isOpen,
    onSelect: handleCommandExecute,
    onClose: () => onOpenChange(false),
    circular: true,
  });

  // Global keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!isOpen);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onOpenChange]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset query when closed
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && focusedIndex === -1 && flatCommands.length > 0) {
      handleCommandExecute(flatCommands[0]);
    } else {
      handleKeyDown(e);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.getBackdrop()}
        onClick={() => onOpenChange(false)}
      />

      {/* Command Palette */}
      <div className={cn(styles.getPaletteContainer(theme), className)}>
        {/* Search Input */}
        <div className={styles.getSearchContainer(theme)}>
          <Search className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            className={styles.getSearchInput(theme)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className={styles.getClearButton(theme)}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <div className={styles.shortcutHint}>
            <kbd className={styles.getShortcutKey(theme)}>Esc</kbd>
          </div>
        </div>

        {/* Command Groups */}
        <div className={styles.groupsContainer}>
          {groupedCommands.length > 0 ? (
            groupedCommands.map((group, groupIndex) => {
              const groupStartIndex = groupedCommands
                .slice(0, groupIndex)
                .reduce((sum, g) => sum + g.commands.length, 0);

              return (
                <div key={group.id} className={styles.commandGroup}>
                  <div className={styles.getGroupLabel(theme)}>
                    {group.label}
                  </div>
                  {group.commands.map((command, cmdIndex) => {
                    const globalIndex = groupStartIndex + cmdIndex;
                    const isSelected = focusedIndex === globalIndex;
                    const Icon = command.icon || getDefaultIcon(command.category);

                    return (
                      <button
                        key={command.id}
                        onClick={() => handleCommandExecute(command)}
                        onMouseEnter={() => setFocusedIndex(globalIndex)}
                        className={styles.getCommandItem(theme, isSelected)}
                      >
                        <Icon className={styles.commandIcon} />
                        <div className={styles.commandContent}>
                          <div className={styles.commandHeader}>
                            <span className={styles.getCommandLabel(theme)}>
                              {command.label}
                            </span>
                            {command.badge && (
                              <span className={styles.getBadge()}>
                                {command.badge}
                              </span>
                            )}
                          </div>
                          {command.description && (
                            <p className={styles.getCommandDescription(theme)}>
                              {command.description}
                            </p>
                          )}
                        </div>
                        {command.shortcut ? (
                          <div className={styles.shortcutContainer}>
                            {command.shortcut.split('+').map((key, i, arr) => (
                              <React.Fragment key={i}>
                                <kbd className={styles.getShortcutKey(theme)}>
                                  {key}
                                </kbd>
                                {i < arr.length - 1 && (
                                  <span className="mx-0.5">+</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        ) : isSelected ? (
                          <CornerDownLeft className="h-3.5 w-3.5 opacity-40" />
                        ) : (
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-40" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.getEmptyStateText(theme)}>
                No commands found
              </p>
              <p className={styles.getEmptyStateHint(theme)}>
                Try a different search term
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.getFooter(theme)}>
          <div className={styles.footerHints}>
            <span className={styles.getFooterHint(theme)}>
              <kbd className={styles.getShortcutKey(theme)}>↑↓</kbd> Navigate
            </span>
            <span className={styles.getFooterHint(theme)}>
              <kbd className={styles.getShortcutKey(theme)}>↵</kbd> Select
            </span>
            <span className={styles.getFooterHint(theme)}>
              <kbd className={styles.getShortcutKey(theme)}>Esc</kbd> Close
            </span>
          </div>
          {enableAI && (
            <div className={styles.aiIndicator}>
              <Sparkles className="h-3 w-3" />
              <span className={styles.getAiText()}>AI Enabled</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Helper functions
function getCategoryLabel(category: CommandCategory): string {
  const labels: Record<CommandCategory, string> = {
    navigation: 'Navigation',
    action: 'Actions',
    search: 'Search Results',
    recent: 'Recent',
    ai: 'AI Suggestions',
  };
  return labels[category];
}

function getDefaultIcon(category: CommandCategory): LucideIcon {
  const icons: Record<CommandCategory, LucideIcon> = {
    navigation: Command,
    action: Sparkles,
    search: Search,
    recent: Clock,
    ai: Sparkles,
  };
  return icons[category];
}
