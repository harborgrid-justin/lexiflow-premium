/**
 * @module components/sidebar/SidebarNav.styles
 * @category Layout - Styles
 * @description Style definitions for SidebarNav component.
 */

import { cn } from '@/utils/cn';
import type { tokens } from '@/components/theme/tokens';

type Theme = typeof tokens.colors.light;

export const navContainer = "flex-1 overflow-y-auto py-6 px-3 space-y-8 custom-scrollbar touch-auto";

export const getCategoryHeader = (theme: Theme) => cn(
  "px-3 text-[10px] font-bold uppercase tracking-wider mb-2",
  theme.text.tertiary
);

export const itemsContainer = "space-y-0.5";

export const getNavItemButton = (theme: Theme, isActive: boolean) => cn(
  "w-full flex items-center space-x-3 px-3 h-9 rounded-lg text-sm font-medium transition-all duration-200 group relative",
  isActive
    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
    : cn(theme.text.secondary, `hover:${theme.surface.highlight}`, `hover:${theme.text.primary}`)
);

export const getNavItemIcon = (isActive: boolean) => cn(
  "h-4 w-4 shrink-0 transition-colors",
  isActive ? "text-blue-600 dark:text-blue-400" : "opacity-70 group-hover:opacity-100"
);

export const navItemLabel = "truncate";

export const activeIndicator = "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full";

export const submenuContainer = "ml-4 mt-1 space-y-0.5 border-l-2 border-slate-200 dark:border-slate-700 pl-2";

export const getSubmenuButton = (theme: Theme, isChildItemActive: boolean) => cn(
  "w-full flex items-center space-x-2 px-2 h-8 rounded text-xs font-medium transition-all duration-200 group",
  isChildItemActive
    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
    : cn(theme.text.tertiary, `hover:${theme.surface.highlight}`, `hover:${theme.text.primary}`)
);

export const getSubmenuIcon = (isChildItemActive: boolean) => cn(
  "h-3.5 w-3.5 shrink-0",
  isChildItemActive ? "text-blue-600 dark:text-blue-400" : "opacity-60"
);

export const submenuLabel = "truncate";
