/**
 * @module components/organisms/search/EnhancedSearch.styles
 * @category Search - Styles
 * @description Style definitions for EnhancedSearch component.
 */

import { cn } from '@/utils/cn';
import type { tokens } from '@/components/theme/tokens';

type Theme = typeof tokens.colors;

export const searchContainer = (className?: string) => cn("relative w-full", className);

export const getInputContainer = (theme: Theme, isOpen: boolean) => cn(
  "relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
  theme.surface.input,
  theme.border.default,
  isOpen && theme.border.focused,
  "focus-within:ring-2 focus-within:ring-offset-0 focus-within:ring-blue-500"
);

export const getSearchIcon = (theme: Theme) => cn(
  "h-4 w-4 flex-shrink-0",
  theme.text.tertiary
);

export const getSearchInput = (theme: Theme) => cn(
  "flex-1 bg-transparent outline-none text-sm",
  theme.text.primary,
  "placeholder:text-slate-400 dark:placeholder:text-slate-600"
);

export const getClearButton = (theme: Theme) => cn(
  "p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors",
  theme.text.tertiary
);

export const clearIcon = "h-3 w-3";

export const syntaxHintsContainer = "flex items-center gap-1 text-xs text-slate-400";

export const commandIcon = "h-3 w-3";

export const categoriesContainer = "flex items-center gap-1 mt-2";

export const getCategoryButton = (theme: Theme, isActive: boolean) => cn(
  "px-2 py-1 text-xs font-medium rounded transition-colors capitalize",
  isActive
    ? cn(theme.primary.DEFAULT, 'text-white')
    : cn(theme.surface.input, theme.text.secondary, "hover:bg-slate-200 dark:hover:bg-slate-700")
);

export const getDropdownContainer = (theme: Theme) => cn(
  "absolute z-50 w-full mt-2 rounded-lg border shadow-lg overflow-hidden",
  theme.surface.default,
  theme.border.default
);

export const dropdownScrollContainer = "max-h-96 overflow-y-auto";

export const getSuggestionButton = (theme: Theme, isSelected: boolean) => cn(
  "w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors",
  isSelected
    ? cn(theme.primary.light, theme.primary.text)
    : cn(theme.surface.default, "hover:bg-slate-100 dark:hover:bg-slate-800")
);

export const getSuggestionIcon = (theme: Theme, isSelected: boolean) => cn(
  "flex-shrink-0",
  isSelected ? theme.primary.text : theme.text.tertiary
);

export const suggestionContentContainer = "flex-1 min-w-0";

export const getSuggestionText = (theme: Theme, isSelected: boolean) => cn(
  "text-sm truncate",
  isSelected ? theme.primary.text : theme.text.primary
);

export const getSuggestionMetadata = (theme: Theme, isSelected: boolean) => cn(
  "text-xs mt-0.5",
  isSelected ? theme.primary.text : theme.text.tertiary
);

export const getSuggestionCategory = (theme: Theme, isSelected: boolean) => cn(
  "text-xs capitalize flex-shrink-0",
  isSelected ? theme.primary.text : theme.text.tertiary
);
