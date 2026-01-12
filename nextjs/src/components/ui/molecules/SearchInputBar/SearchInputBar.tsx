/**
 * @module components/common/layout/SearchInputBar
 * @category Common Components - Inputs
 * @description Standard styled search input without full toolbar overhead
 */

import React, { useId } from 'react';
import { Search } from 'lucide-react';
import { useTheme } from '@/providers';
import { cn } from '@/utils/cn';

export type SearchInputBarProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * SearchInputBar - React 18 optimized with React.memo and useId
 */
export const SearchInputBar = React.memo<SearchInputBarProps>(({ className, ...props }) => {
  const { theme } = useTheme();
  const inputId = useId();
  
  return (
    <div className={cn("relative w-full", className)}>
      <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)} aria-hidden="true"/>
      <input 
        id={inputId}
        aria-label="Search"
        className={cn(
          "w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600", 
          theme.surface.default, 
          theme.border.default, 
          theme.text.primary
        )}
        {...props}
      />
    </div>
  );
});
SearchInputBar.displayName = 'SearchInputBar';
