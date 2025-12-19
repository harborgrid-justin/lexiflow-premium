/**
 * chartConfig.ts
 * 
 * Shared chart configuration and theming utilities
 * Eliminates repeated chart setup across components
 */

import { CSSProperties } from 'react';

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
 * Get chart theme based on dark/light mode
 */
export const getChartTheme = (isDark: boolean): ChartTheme => {
  if (isDark) {
    return {
      colors: {
        primary: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#06b6d4'
      },
      text: '#94a3b8',
      grid: '#334155',
      tooltipBg: '#1e293b',
      tooltipBorder: '#475569',
      tooltipStyle: {
        backgroundColor: '#1e293b',
        borderColor: '#475569',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
        color: '#f1f5f9'
      }
    };
  }

  return {
    colors: {
      primary: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#06b6d4'
    },
    text: '#64748b',
    grid: '#e2e8f0',
    tooltipBg: '#ffffff',
    tooltipBorder: '#e2e8f0',
    tooltipStyle: {
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      color: '#0f172a'
    }
  };
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
