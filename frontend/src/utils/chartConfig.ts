/**
 * chartConfig.ts
 * 
 * Shared chart configuration and theming utilities
 * Eliminates repeated chart setup across components
 * 
 * ✅ REFACTORED: Now uses centralized theme tokens instead of hardcoded colors
 */

import { CSSProperties } from 'react';
import { ChartColorService } from '../services/theme/chartColorService';
import { ThemeMode } from '../components/theme/tokens';

// ============================================================================
// TYPES
// ============================================================================
export interface ChartTheme {
  colors: {
    primary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    secondary: string;
    neutral: string;
  };
  text: string;
  grid: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipStyle: CSSProperties;
}

export interface ChartMargins {
  top: number;
  right: number;
  left: number;
  bottom: number;
}

// ============================================================================
// CHART THEMES
// ============================================================================

/**
 * Get chart theme based on theme mode
 * @param mode - 'light' or 'dark' theme mode
 */
export const getChartTheme = (mode: ThemeMode): ChartTheme => {
  const themeConfig = ChartColorService.getChartTheme(mode);
  const tooltipStyle = ChartColorService.getTooltipStyle(mode);

  return {
    colors: {
      primary: themeConfig.colors.primary,
      success: themeConfig.colors.success,
      warning: themeConfig.colors.warning,
      danger: themeConfig.colors.danger,
      info: themeConfig.colors.primary, // Using primary as info fallback
      secondary: themeConfig.colors.secondary,
      neutral: themeConfig.colors.neutral
    },
    text: themeConfig.text,
    grid: themeConfig.grid,
    tooltipBg: themeConfig.tooltip.bg,
    tooltipBorder: themeConfig.tooltip.border,
    tooltipStyle
  };
};

/**
 * Legacy compatibility: Get chart theme based on isDark boolean
 * @deprecated Use getChartTheme(mode: ThemeMode) instead
 */
export const getChartThemeFromDark = (isDark: boolean): ChartTheme => {
  return getChartTheme(isDark ? 'dark' : 'light');
};

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Standard chart margins
 */
export const DEFAULT_MARGINS: ChartMargins = {
  top: 20,
  right: 30,
  left: 0,
  bottom: 5
};

/**
 * Compact chart margins for small spaces
 */
export const COMPACT_MARGINS: ChartMargins = {
  top: 10,
  right: 10,
  left: 0,
  bottom: 5
};

/**
 * Standard axis configuration
 */
export const getAxisConfig = (theme: ChartTheme) => ({
  fontSize: 12,
  tickLine: false,
  axisLine: false,
  tick: { fill: theme.text }
});

/**
 * Standard grid configuration
 */
export const getGridConfig = (theme: ChartTheme) => ({
  strokeDasharray: '3 3',
  vertical: false,
  stroke: theme.grid
});

/**
 * Standard tooltip configuration
 */
export const getTooltipConfig = (theme: ChartTheme) => ({
  contentStyle: theme.tooltipStyle,
  cursor: { fill: theme.grid }
});
