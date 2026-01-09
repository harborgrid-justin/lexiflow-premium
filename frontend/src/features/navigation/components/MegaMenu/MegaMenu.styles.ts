/**
 * @module components/navigation/MegaMenu.styles
 * @category Navigation - Styles
 * @description Style definitions for MegaMenu component.
 */

import type { ThemeObject } from "@/contexts/theme/ThemeContext";
import { cn } from "@/shared/lib/cn";

// Define type locally to avoid circular dependency
export type MegaMenuLayout = "single" | "double" | "triple" | "quad";

type Theme = ThemeObject;

export const megaMenuContainer = "relative";

export const getTriggerButton = (
  theme: Theme,
  isOpen: boolean,
  disabled: boolean
) =>
  cn(
    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
    disabled
      ? cn(theme.text.tertiary, "cursor-not-allowed opacity-50")
      : isOpen
        ? cn(theme.surface.highlight, theme.text.primary)
        : cn(
            theme.text.secondary,
            `hover:${theme.surface.highlight}`,
            `hover:${theme.text.primary}`
          )
  );

export const getDropdownContainer = (theme: Theme, layout: MegaMenuLayout) => {
  const layoutClasses = {
    single: "w-80",
    double: "w-[600px]",
    triple: "w-[900px]",
    quad: "w-[1200px]",
  };

  return cn(
    "absolute top-full left-0 mt-2 rounded-xl shadow-2xl border overflow-hidden z-50",
    "animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200",
    theme.surface.default,
    theme.border.default,
    layoutClasses[layout]
  );
};

export const getFeaturedSection = (theme: Theme) =>
  cn(
    "p-6 border-b bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30",
    theme.border.default
  );

export const getFeaturedTitle = (theme: Theme) =>
  cn("text-xs font-bold uppercase tracking-wider mb-4", theme.text.tertiary);

export const featuredGrid = "grid grid-cols-3 gap-3";

export const getFeaturedItem = (theme: Theme) =>
  cn(
    "flex flex-col items-start gap-3 p-4 rounded-lg border transition-all duration-200 text-left",
    "hover:shadow-md hover:scale-105",
    theme.surface.default,
    theme.border.default,
    `hover:${theme.surface.highlight}`
  );

export const getFeaturedIconContainer = (theme: Theme) =>
  cn(
    "flex items-center justify-center w-10 h-10 rounded-lg",
    theme.primary.light
  );

export const featuredIcon = "h-5 w-5 text-blue-600 dark:text-blue-400";

export const featuredContent = "flex-1 w-full";

export const featuredItemHeader =
  "flex items-center justify-between gap-2 mb-1";

export const getFeaturedItemLabel = (theme: Theme) =>
  cn("text-sm font-bold truncate", theme.text.primary);

export const getFeaturedItemDescription = (theme: Theme) =>
  cn("text-xs line-clamp-2", theme.text.secondary);

export const getSectionsGrid = (layout: MegaMenuLayout) => {
  const gridClasses = {
    single: "grid-cols-1",
    double: "grid-cols-2",
    triple: "grid-cols-3",
    quad: "grid-cols-4",
  };

  return cn("grid gap-6 p-6", gridClasses[layout]);
};

export const section = "space-y-3";

export const sectionHeader = "flex items-center gap-2 pb-2";

export const sectionIcon = "h-4 w-4 opacity-60";

export const getSectionTitle = (theme: Theme) =>
  cn("text-xs font-bold uppercase tracking-wider", theme.text.tertiary);

export const sectionItems = "space-y-1";

export const getMenuItem = (theme: Theme) =>
  cn(
    "w-full text-left p-2.5 rounded-lg transition-all duration-200",
    `hover:${theme.surface.highlight}`,
    "focus:outline-none focus:ring-2 focus:ring-blue-500/20"
  );

export const menuItemContent = "flex items-start gap-3";

export const menuItemIcon = "h-4 w-4 mt-0.5 shrink-0 opacity-70";

export const menuItemText = "flex-1 min-w-0";

export const menuItemHeader = "flex items-center gap-2 mb-0.5";

export const getMenuItemLabel = (theme: Theme) =>
  cn("text-sm font-medium truncate", theme.text.primary);

export const getMenuItemDescription = (theme: Theme) =>
  cn("text-xs line-clamp-2 mt-0.5", theme.text.secondary);

export const getBadge = (
  variant: "primary" | "success" | "warning" | "info"
) => {
  const variantClasses = {
    primary: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    success:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    warning:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    info: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  };

  return cn(
    "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
    variantClasses[variant]
  );
};
