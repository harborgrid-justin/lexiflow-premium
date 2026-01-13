/**
 * @module components/common/SearchToolbar
 * @category Common Components - Search
 * @description Search toolbar with history dropdown and keyboard shortcut support (/).
 *
 * THEME SYSTEM USAGE:
 * Uses theme.surface, theme.text, theme.border, and theme.border.focused for consistent theming.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Clock, Search } from 'lucide-react';
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/features/theme';
import { useSearchToolbar } from '../hooks/useSearchToolbar';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface SearchToolbarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function SearchToolbar({ value, onChange, placeholder = "Search (Press /)...", actions, className = "" }: SearchToolbarProps) {
  const { theme } = useTheme();
  const {
    inputRef,
    containerRef,
    inputId,
    showHistory,
    history,
    handleFocus,
    handleHistorySelect,
    handleKeyUp
  } = useSearchToolbar({ value, onChange });

  return (
    <div className={cn("flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default, className)}>
      <div className="relative w-full md:max-w-md" ref={containerRef}>
        <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)} />
        <input
          ref={inputRef}
          id={inputId}
          aria-label="Search input"
          className={cn(
            "w-full pl-9 pr-4 py-2 border rounded-md text-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500",
            theme.surface.highlight,
            theme.border.default,
            theme.text.primary,
            theme.border.focused
          )}
          placeholder={placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onFocus={handleFocus}
          onKeyUp={handleKeyUp}
        />

        {showHistory && history.length > 0 && !value && (
          <div className={cn("absolute top-full left-0 right-0 mt-1 rounded-md shadow-lg border z-50 overflow-hidden", theme.surface.default, theme.border.default)}>
            <div className={cn("px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500", theme.surface.highlight)}>Recent Searches</div>
            {history.map((term, i) => (
              <button
                key={i}
                className={cn("w-full text-left px-3 py-2 text-sm flex items-center gap-2", theme.text.primary, `hover:${theme.surface.highlight}`)}
                onClick={() => handleHistorySelect(term)}
              >
                <Clock className="h-3 w-3 text-slate-400" /> {term}
              </button>
            ))}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex gap-2 w-full md:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
