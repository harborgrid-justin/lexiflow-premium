/**
 * ChartColorService
 *
 * Centralized service for theme-aware chart colors and color palettes.
 * Eliminates hardcoded hex values and provides consistent color mapping
 * across all chart components and data services.
 *
 * @module services/theme/chartColorService
 */

import { tokens, ThemeMode } from '@theme/tokens';

export class ChartColorService {
  /**
   * Get all chart colors for the current theme mode
   */
  static getChartColors(mode: ThemeMode) {
    return tokens.colors[mode].chart.colors;
  }

  /**
   * Get risk-based colors (low/medium/high)
   * Used by: ComplianceDomain, clauseAnalytics, etc.
   */
  static getRiskColors(mode: ThemeMode) {
    const chart = tokens.colors[mode].chart.colors;
    return {
      low: chart.success,
      medium: chart.warning,
      high: chart.danger
    };
  }

  /**
   * Get status-based colors for indicators
   * Used by: Status badges, alerts, notifications
   */
  static getStatusColors(mode: ThemeMode) {
    const status = tokens.colors[mode].status;
    return {
      success: status.success.icon,
      warning: status.warning.icon,
      error: status.error.icon,
      info: status.info.icon,
      neutral: status.neutral.icon
    };
  }

  /**
   * Get chart theme configuration (grid, text, tooltip)
   * Used by: Recharts components
   */
  static getChartTheme(mode: ThemeMode) {
    const theme = tokens.colors[mode];
    return {
      grid: theme.chart.grid,
      text: theme.chart.text,
      tooltip: theme.chart.tooltip,
      colors: theme.chart.colors
    };
  }

  /**
   * Get a color from the chart palette by index
   * Used for dynamic color assignment (e.g., multiple series)
   *
   * @param index - Index in the palette (will wrap around)
   * @param mode - Theme mode
   */
  static getColorByIndex(index: number, mode: ThemeMode): string {
    const colors = tokens.colors[mode].chart.colors;
    const palette = [
      colors.primary,
      colors.secondary,
      colors.success,
      colors.warning,
      colors.danger,
      colors.neutral
    ];
    return palette[index % palette.length]!;
  }

  /**
   * Get user/collaboration color by index
   * Ensures consistent color assignment for users in collaborative features
   *
   * @param index - User index
   * @param mode - Theme mode
   */
  static getUserColor(index: number, mode: ThemeMode): string {
    const colors = tokens.colors[mode].chart.colors;
    const userPalette = [
      colors.blue,      // blue
      colors.emerald,   // emerald/green
      colors.warning,   // amber
      colors.danger,    // rose/red
      colors.purple,    // purple
      '#ec4899',        // pink (fallback - TODO: add to tokens)
      '#14b8a6',        // teal (fallback - TODO: add to tokens)
      '#f97316'         // orange (fallback - TODO: add to tokens)
    ];
    return userPalette[index % userPalette.length]!;
  }

  /**
   * Get category/industry colors
   * Used by: CRMDomain, KnowledgeDomain analytics
   */
  static getCategoryColors(mode: ThemeMode) {
    const colors = tokens.colors[mode].chart.colors;
    return {
      tech: colors.blue,
      finance: colors.purple,
      healthcare: colors.emerald,
      legal: colors.primary,
      other: colors.neutral
    };
  }

  /**
   * Get jurisdiction type colors
   * Used by: Jurisdiction maps
   */
  static getJurisdictionColors(mode: ThemeMode) {
    const colors = tokens.colors[mode].chart.colors;
    return {
      federal: colors.blue,
      state: colors.emerald
    };
  }

  /**
   * Get entity type colors for graph visualizations
   * Used by: NexusGraph, GraphOverlay
   */
  static getEntityColors(mode: ThemeMode) {
    const colors = tokens.colors[mode].chart.colors;

    return {
      case: mode === 'dark' ? '#1e293b' : '#0f172a',
      individual: colors.blue,
      organization: colors.purple,
      evidence: colors.warning,
      document: colors.neutral
    };
  }

  /**
   * Get full palette as array (for components that need all colors)
   */
  static getPalette(mode: ThemeMode): string[] {
    const colors = tokens.colors[mode].chart.colors;
    return [
      colors.primary,
      colors.secondary,
      colors.success,
      colors.warning,
      colors.danger,
      colors.neutral
    ];
  }

  /**
   * Get Recharts tooltip style object
   * Used directly in Tooltip components
   */
  static getTooltipStyle(mode: ThemeMode) {
    const tooltip = tokens.colors[mode].chart.tooltip;
    return {
      backgroundColor: tooltip.bg,
      borderColor: tooltip.border,
      color: tooltip.text,
      borderRadius: '8px',
      border: 'none',
      boxShadow: mode === 'dark'
        ? '0 4px 6px -1px rgb(0 0 0 / 0.3)'
        : '0 4px 6px -1px rgb(0 0 0 / 0.1)'
    };
  }
}
