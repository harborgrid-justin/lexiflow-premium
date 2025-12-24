/**
 * @module components/common/layout/SearchInputBar
 * @category Common Components - Inputs
 * @description Standard styled search input without full toolbar overhead
 */

import React from 'react';
import { Search } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

export type SearchInputBarProps = React.InputHTMLAttributes<HTMLInputElement>;

export const SearchInputBar: React.FC<SearchInputBarProps> = ({ className, ...props }) => {
  const { theme } = useTheme();
  
  return (
    <div className={cn("relative w-full", className)}>
      <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)}/>
      <input 
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
};
