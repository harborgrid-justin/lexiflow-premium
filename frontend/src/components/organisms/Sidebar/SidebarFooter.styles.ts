/**
 * @module components/sidebar/SidebarFooter.styles
 * @category Layout - Styles
 * @description Style definitions for SidebarFooter component.
 */

import { cn } from '@/utils/cn';
import type { tokens } from '@/components/theme/tokens';

type Theme = typeof tokens.colors.light;

export const getFooterContainer = (theme: Theme) => cn(
  "p-4 border-t shrink-0",
  theme.surface.highlight,
  theme.border.default
);

export const statusIndicatorContainer = "mb-3";

export const holographicModeContainer = "mb-4 flex items-center justify-between px-1";

export const getHolographicModeLabel = (theme: Theme) => cn(
  "text-xs font-bold uppercase tracking-wide",
  theme.text.tertiary
);

export const getToggleButton = (theme: Theme, isEnabled: boolean) => cn(
  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
  isEnabled ? theme.action.primary.bg : theme.surface.active
);

export const getToggleIndicator = (isEnabled: boolean) => cn(
  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
  isEnabled ? "translate-x-4" : "translate-x-0"
);

export const getUserButton = (theme: Theme, isActive: boolean) => cn(
  "w-full flex items-center p-2 rounded-lg transition-colors group mb-3 border shadow-sm",
  isActive ? theme.primary.light : theme.surface.default,
  theme.border.default,
  `hover:${theme.surface.highlight}`
);

export const userAvatarWrapper = "mr-3";

export const userInfoContainer = "text-left flex-1 min-w-0";

export const getUserName = (theme: Theme) => cn(
  "text-xs font-bold truncate",
  theme.text.primary
);

export const getUserRole = (theme: Theme) => cn(
  "text--[10px] truncate font-medium",
  theme.text.secondary
);

export const getChevronIcon = (theme: Theme) => cn(
  "h-4 w-4 opacity-50",
  theme.text.tertiary
);

export const actionButtonsGrid = "grid grid-cols-2 gap-2";

export const getActionButton = (theme: Theme) => cn(
  "h-8 px-2 text-xs font-medium rounded transition-colors flex items-center justify-center border",
  theme.surface.default,
  theme.border.default,
  theme.text.secondary,
  `hover:${theme.text.primary} hover:${theme.surface.highlight}`
);

export const actionButtonIcon = "h-3.5 w-3.5 mr-1.5";
