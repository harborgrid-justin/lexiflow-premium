/**
 * @module components/navigation/QuickActions.styles
 * @category Navigation - Styles
 * @description Style definitions for QuickActions component.
 */

import type { ThemeObject } from "@/theme";
import { cn } from "@/shared/lib/cn";

type Theme = ThemeObject;

export const quickActionsContainer = "relative";

export const getTriggerButton = (theme: Theme, disabled: boolean) =>
  cn(
    "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-bold shadow-sm",
    "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
    disabled
      ? cn(theme.text.tertiary, "cursor-not-allowed opacity-50")
      : cn(
          theme.surface.default,
          theme.border.default,
          theme.text.primary,
          `hover:${theme.surface.highlight}`,
          "hover:shadow-md"
        )
  );

export const getDropdownContainer = (
  theme: Theme,
  position: "left" | "right" | "center",
  maxWidth: "sm" | "md" | "lg"
) => {
  const positionClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  const maxWidthClasses = {
    sm: "w-80",
    md: "w-96",
    lg: "w-[32rem]",
  };

  return cn(
    "absolute top-full mt-2 rounded-xl shadow-2xl border overflow-hidden z-50",
    "animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200",
    theme.surface.default,
    theme.border.default,
    positionClasses[position],
    maxWidthClasses[maxWidth]
  );
};

export const getHeader = (theme: Theme) =>
  cn(
    "flex items-center justify-between px-4 py-3 border-b",
    theme.border.default
  );

export const getHeaderTitle = (theme: Theme) =>
  cn("text-sm font-bold", theme.text.primary);

export const getCloseButton = (theme: Theme) =>
  cn(
    "p-1 rounded-md transition-colors",
    theme.text.tertiary,
    `hover:${theme.surface.highlight}`,
    `hover:${theme.text.primary}`
  );

export const groupsContainer = "max-h-[500px] overflow-y-auto custom-scrollbar";

export const actionGroup = "py-2";

export const getGroupTitle = (theme: Theme) =>
  cn(
    "px-4 py-2 text-xs font-bold uppercase tracking-wider",
    theme.text.tertiary
  );

export const actionsContainer = "space-y-1 px-2";

export const getActionButton = (theme: Theme, disabled: boolean) =>
  cn(
    "w-full flex items-start gap-3 p-3 rounded-lg transition-all duration-200 text-left",
    disabled
      ? cn("opacity-50 cursor-not-allowed")
      : cn(
          `hover:${theme.surface.highlight}`,
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        )
  );

export const getActionIconContainer = (
  variant: "primary" | "success" | "warning" | "danger" | "info"
) => {
  const variantClasses = {
    primary: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    success:
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    warning:
      "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    danger: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return cn(
    "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
    variantClasses[variant]
  );
};

export const actionIcon = "h-4 w-4";

export const actionContent = "flex-1 min-w-0";

export const actionHeader = "flex items-center gap-2 mb-0.5";

export const getActionLabel = (theme: Theme) =>
  cn("text-sm font-medium truncate", theme.text.primary);

export const getActionDescription = (theme: Theme) =>
  cn("text-xs line-clamp-2 mt-0.5", theme.text.secondary);

export const shortcut = "flex items-center gap-0.5 ml-auto shrink-0";

export const getShortcutKey = (theme: Theme) =>
  cn(
    "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border",
    theme.surface.highlight,
    theme.border.default,
    theme.text.tertiary
  );

export const getBadge = () =>
  cn(
    "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
  );

export const getDivider = (theme: Theme) =>
  cn("mx-4 my-2 h-px", theme.border.default);
