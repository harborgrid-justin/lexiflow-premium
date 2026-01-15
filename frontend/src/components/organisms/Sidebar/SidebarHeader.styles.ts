/**
 * @module components/sidebar/SidebarHeader.styles
 * @category Layout - Styles
 * @description Style definitions for SidebarHeader component.
 */

import type { ThemeObject } from '@/lib/theme/types';
import { cn } from "@/lib/cn";

type Theme = ThemeObject;

export const getHeaderContainer = (theme: Theme) =>
  cn(
    "h-16 flex items-center justify-between px-6 border-b shrink-0",
    theme.surface.default,
    theme.border.default
  );

export const brandingContainer = "flex items-center space-x-3";

export const getLogoContainer = (theme: Theme) =>
  cn(
    "p-1.5 rounded-lg shadow-sm border",
    theme.primary.DEFAULT,
    theme.primary.border
  );

export const logoIcon = "h-5 w-5 text-white";

export const textContainer = "";

export const getTenantName = (theme: Theme) =>
  cn("text-lg font-bold tracking-tight leading-none", theme.text.primary);

export const getTenantTier = (theme: Theme) =>
  cn(
    "text-[10px] uppercase tracking-widest font-bold mt-0.5 opacity-60",
    theme.text.primary
  );

export const getCloseButton = (theme: Theme) =>
  cn(
    "md:hidden p-1.5 rounded-md transition-colors",
    theme.text.tertiary,
    `hover:${theme.surface.highlight}`,
    `hover:${theme.text.primary}`
  );

export const closeIcon = "h-5 w-5";
