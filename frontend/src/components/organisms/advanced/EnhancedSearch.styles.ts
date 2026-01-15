/**
 * @module components/organisms/search/EnhancedSearch.styles
 * @category Search - Styles
 * @description Style definitions for EnhancedSearch component.
 */

import type { ThemeObject } from "@/theme";
import { cn } from "@/lib/cn";

type Theme = ThemeObject;

export const searchContainer = (className?: string) =>
  cn("relative w-full", className);

export const getInputContainer = (theme: Theme, isOpen: boolean) =>
  cn(
    "relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
    theme.border.default,
    isOpen && cn(theme.border.focus),
    "focus-within:ring-2 focus-within:ring-offset-0",
    isOpen && "focus-within:ring-blue-500"
  );

export const getSearchIcon = (_theme: Theme) =>
  cn("h-4 w-4 flex-shrink-0 text-slate-500");

export const getSearchInput = (_theme: Theme) =>
  cn(
    "flex-1 bg-transparent outline-none text-sm",
    "text-slate-900 dark:text-slate-100",
    "placeholder:text-slate-400 dark:placeholder:text-slate-600"
  );

export const getClearButton = (theme: Theme) =>
  cn(
    "p-1 rounded transition-colors",
    theme.text.secondary,
    `hover:${theme.surface.hover}`
  );

export const clearIcon = "h-3 w-3";

export const syntaxHintsContainer =
  "flex items-center gap-1 text-xs text-slate-400";

export const commandIcon = "h-3 w-3";

export const categoriesContainer = "flex items-center gap-1 mt-2";

export const getCategoryButton = (theme: Theme, isActive: boolean) =>
  cn(
    "px-2 py-1 text-xs font-medium rounded transition-colors capitalize",
    isActive
      ? cn(theme.colors.primary, "text-white")
      : cn(
          theme.surface.default,
          theme.text.primary,
          `hover:${theme.surface.hover}`
        )
  );

export const getDropdownContainer = (theme: Theme) =>
  cn(
    "absolute z-50 w-full mt-2 rounded-lg shadow-lg overflow-hidden",
    theme.surface.default,
    theme.border.default
  );

export const dropdownScrollContainer = "max-h-96 overflow-y-auto";

export const getSuggestionButton = (theme: Theme, isSelected: boolean) =>
  cn(
    "w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors",
    isSelected
      ? cn(theme.surface.active, theme.text.primary)
      : cn(theme.surface.default, `hover:${theme.surface.hover}`)
  );

export const getSuggestionIcon = (theme: Theme, isSelected: boolean) =>
  cn("flex-shrink-0", isSelected ? theme.text.primary : theme.text.secondary);

export const suggestionContentContainer = "flex-1 min-w-0";

export const getSuggestionText = (theme: Theme, isSelected: boolean) =>
  cn("text-sm truncate", isSelected ? theme.text.primary : theme.text.primary);

export const getSuggestionMetadata = (theme: Theme, isSelected: boolean) =>
  cn("text-xs mt-0.5", isSelected ? theme.text.primary : theme.text.secondary);

export const getSuggestionCategory = (theme: Theme, isSelected: boolean) =>
  cn(
    "text-xs capitalize flex-shrink-0",
    isSelected ? theme.text.primary : theme.text.secondary
  );
