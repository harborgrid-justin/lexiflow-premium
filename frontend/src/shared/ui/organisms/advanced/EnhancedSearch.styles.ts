/**
 * @module components/organisms/search/EnhancedSearch.styles
 * @category Search - Styles
 * @description Style definitions for EnhancedSearch component.
 */

import type { ThemeObject } from "@/theme";
import { cn } from "@/shared/lib/cn";

type Theme = ThemeObject;

export const searchContainer = (className?: string) =>
  cn("relative w-full", className);

export const getInputContainer = (_theme: Theme, isOpen: boolean) =>
  cn(
    "relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
    isOpen && "border-blue-500",
    "focus-within:ring-2 focus-within:ring-offset-0 focus-within:ring-blue-500"
  );

export const getSearchIcon = (_theme: Theme) =>
  cn("h-4 w-4 flex-shrink-0 text-slate-500");

export const getSearchInput = (_theme: Theme) =>
  cn(
    "flex-1 bg-transparent outline-none text-sm",
    "text-slate-900 dark:text-slate-100",
    "placeholder:text-slate-400 dark:placeholder:text-slate-600"
  );

export const getClearButton = (_theme: Theme) =>
  cn(
    "p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500"
  );

export const clearIcon = "h-3 w-3";

export const syntaxHintsContainer =
  "flex items-center gap-1 text-xs text-slate-400";

export const commandIcon = "h-3 w-3";

export const categoriesContainer = "flex items-center gap-1 mt-2";

export const getCategoryButton = (_theme: Theme, isActive: boolean) =>
  cn(
    "px-2 py-1 text-xs font-medium rounded transition-colors capitalize",
    isActive
      ? "bg-blue-600 text-white"
      : "bg-white text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
  );

export const getDropdownContainer = (_theme: Theme) =>
  cn(
    "absolute z-50 w-full mt-2 rounded-lg border shadow-lg overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
  );

export const dropdownScrollContainer = "max-h-96 overflow-y-auto";

export const getSuggestionButton = (_theme: Theme, isSelected: boolean) =>
  cn(
    "w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors",
    isSelected
      ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
      : "bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800"
  );

export const getSuggestionIcon = (_theme: Theme, isSelected: boolean) =>
  cn(
    "flex-shrink-0",
    isSelected ? "text-blue-900 dark:text-blue-100" : "text-slate-500"
  );

export const suggestionContentContainer = "flex-1 min-w-0";

export const getSuggestionText = (_theme: Theme, isSelected: boolean) =>
  cn(
    "text-sm truncate",
    isSelected
      ? "text-blue-900 dark:text-blue-100"
      : "text-slate-900 dark:text-slate-100"
  );

export const getSuggestionMetadata = (_theme: Theme, isSelected: boolean) =>
  cn(
    "text-xs mt-0.5",
    isSelected ? "text-blue-900 dark:text-blue-100" : "text-slate-500"
  );

export const getSuggestionCategory = (_theme: Theme, isSelected: boolean) =>
  cn(
    "text-xs capitalize flex-shrink-0",
    isSelected ? "text-blue-900 dark:text-blue-100" : "text-slate-500"
  );
