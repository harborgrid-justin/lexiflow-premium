/**
 * @module components/organisms/search/SearchComponents.styles
 * @category Search - Styles
 * @description Style definitions for SearchComponents (CategoryFilter, SuggestionItem).
 */

import { cn } from '@/shared/lib/cn';

// CategoryFilter styles
export const categoryFilterContainer = "flex gap-1 px-2 py-1 border-b";

export const getCategoryButton = (
  theme: { text: { secondary: string }; surface: { highlight: string } },
  isActive: boolean
) => cn(
  "px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors",
  isActive
    ? theme.surface.highlight
    : cn("hover:bg-slate-100", theme.text.secondary)
);

export const categoryIcon = "";

// SuggestionItem styles
export const getSuggestionButton = (
  theme: { text: { primary: string }; surface: { highlight: string } },
  isSelected: boolean
) => cn(
  "w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 transition-colors",
  isSelected && theme.surface.highlight
);

export const suggestionIcon = "h-4 w-4 text-slate-400";

export const getSuggestionText = (theme: { text: { primary: string } }) => cn(
  "flex-1 text-sm",
  theme.text.primary
);
