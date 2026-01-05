/**
 * @module components/navigation/Breadcrumbs.styles
 * @category Navigation - Styles
 * @description Style definitions for Breadcrumbs component.
 */

import { cn } from '@/utils/cn';
import type { tokens } from '@/components/theme/tokens';

type Theme = typeof tokens.colors.light;

export const getBreadcrumbsContainer = (theme: Theme) => cn(
  "flex items-center py-2 px-1",
  theme.text.secondary
);

export const breadcrumbsList = "flex items-center flex-wrap gap-1";

export const breadcrumbItem = "flex items-center";

export const separator = cn(
  "flex items-center opacity-40 mx-0.5"
);

export const getBreadcrumbButton = (theme: Theme, isLast: boolean, isHome: boolean) => cn(
  "flex items-center gap-2 px-2 py-1 rounded-md transition-all duration-200 text-sm font-medium group",
  isLast
    ? cn(theme.text.primary, "cursor-default")
    : cn(
        theme.text.secondary,
        `hover:${theme.surface.highlight}`,
        `hover:${theme.text.primary}`,
        "focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      ),
  isHome && "px-1.5"
);

export const getBreadcrumbText = (theme: Theme, isLast: boolean) => cn(
  "flex items-center gap-2 px-2 py-1 text-sm font-medium",
  isLast ? theme.text.primary : theme.text.secondary
);

export const itemIcon = "h-3.5 w-3.5 shrink-0";

export const itemLabel = "truncate max-w-[200px]";
