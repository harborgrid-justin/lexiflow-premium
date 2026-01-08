/**
 * @module components/navigation/CommandPalette.styles
 * @category Navigation - Styles
 * @description Style definitions for CommandPalette component.
 */

import type { ThemeObject } from "@/contexts/theme/ThemeContext";
import { cn } from "@/utils/cn";

type Theme = ThemeObject;

export const getBackdrop = () =>
  cn(
    "fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]",
    "animate-in fade-in duration-200"
  );

export const getPaletteContainer = (theme: Theme) =>
  cn(
    "fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl rounded-xl shadow-2xl border overflow-hidden z-[101]",
    "animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-200",
    theme.surface.default,
    theme.border.default
  );

export const getSearchContainer = (theme: Theme) =>
  cn("flex items-center gap-3 px-4 py-3 border-b", theme.border.default);

export const searchIcon = cn("h-5 w-5 shrink-0 opacity-40");

export const getSearchInput = (theme: Theme) =>
  cn(
    "flex-1 text-base font-medium outline-none bg-transparent placeholder-opacity-60",
    theme.text.primary
  );

export const getClearButton = (theme: Theme) =>
  cn(
    "p-1 rounded-md transition-colors",
    theme.text.tertiary,
    `hover:${theme.surface.highlight}`,
    `hover:${theme.text.primary}`
  );

export const shortcutHint = "flex items-center gap-1";

export const getShortcutKey = (theme: Theme) =>
  cn(
    "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border",
    theme.surface.highlight,
    theme.border.default,
    theme.text.tertiary
  );

export const groupsContainer = cn(
  "max-h-[400px] overflow-y-auto custom-scrollbar"
);

export const commandGroup = "py-2";

export const getGroupLabel = (theme: Theme) =>
  cn(
    "px-4 py-2 text-xs font-bold uppercase tracking-wider sticky top-0 backdrop-blur-sm",
    theme.text.tertiary,
    theme.surface.default
  );

export const getCommandItem = (theme: Theme, isSelected: boolean) =>
  cn(
    "w-full flex items-center gap-3 px-4 py-2.5 transition-colors group",
    isSelected
      ? cn(theme.surface.highlight, theme.text.primary)
      : cn("hover:" + theme.surface.highlight)
  );

export const commandIcon = "h-4 w-4 shrink-0 opacity-70";

export const commandContent = "flex-1 min-w-0 text-left";

export const commandHeader = "flex items-center gap-2";

export const getCommandLabel = (theme: Theme) =>
  cn("text-sm font-medium truncate", theme.text.primary);

export const getCommandDescription = (theme: Theme) =>
  cn("text-xs truncate mt-0.5", theme.text.secondary);

export const getBadge = () =>
  cn(
    "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
  );

export const shortcutContainer = "flex items-center gap-0.5 ml-auto shrink-0";

export const emptyState = "py-12 text-center";

export const getEmptyStateText = (theme: Theme) =>
  cn("text-sm font-medium mb-1", theme.text.secondary);

export const getEmptyStateHint = (theme: Theme) =>
  cn("text-xs", theme.text.tertiary);

export const getFooter = (theme: Theme) =>
  cn(
    "flex items-center justify-between px-4 py-2 border-t bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/20",
    theme.border.default
  );

export const footerHints = "flex items-center gap-3";

export const getFooterHint = (theme: Theme) =>
  cn("flex items-center gap-1 text-xs", theme.text.tertiary);

export const aiIndicator = cn(
  "flex items-center gap-1.5 px-2 py-1 rounded-full",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
);

export const getAiText = () =>
  cn("text-[10px] font-bold uppercase tracking-wider");
