/**
 * ChartColorService
 *
 * Centralized service for theme-aware chart colors and color palettes.
 * Eliminates hardcoded hex values and provides consistent color mapping
 * across all chart components and data services.
 *
 * Enterprise React Architecture - Library Layer
 *
 * @module lib/theme/chartColorService
 */

import { type ThemeMode, getTokens } from "./tokens";

export class ChartColorService {
  /**
   * Get all chart colors for the current theme mode
   */
  static getChartColors(mode: ThemeMode) {
    const tokens = getTokens(mode);
    const c = tokens.colors;

    return {
      primary: c.primary,
      secondary: c.secondary,
      success: c.success,
      warning: c.warning,
      danger: c.error,
      info: c.info,
      neutral: c.textMuted,
      blue: c.info,
      emerald: c.success,
      purple: c.accent,
    };
  }

  /**
   * Get risk-based colors (low/medium/high)
   * Used by: ComplianceDomain, clauseAnalytics, etc.
   */
  static getRiskColors(mode: ThemeMode) {
    const chart = this.getChartColors(mode);
    return {
      low: chart.success,
      medium: chart.warning,
      high: chart.danger,
    };
  }

  /**
   * Get status-based colors for indicators
   * Used by: Status badges, alerts, notifications
   */
  static getStatusColors(mode: ThemeMode) {
    const tokens = getTokens(mode);
    const c = tokens.colors;
    return {
      success: c.success,
      warning: c.warning,
      error: c.error,
      info: c.info,
      neutral: c.textMuted,
    };
  }

  /**
   * Get chart theme configuration (grid, text, tooltip)
   * Used by: Recharts components
   */
  static getChartTheme(mode: ThemeMode) {
    const tokens = getTokens(mode);
    const colors = this.getChartColors(mode);
    return {
      grid: tokens.colors.border,
      text: tokens.colors.textMuted,
      tooltip: {
        bg: tokens.colors.surface,
        border: tokens.colors.border,
        text: tokens.colors.text,
      },
      colors,
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
    const colors = this.getChartColors(mode);
    const palette = [
      colors.primary,
      colors.secondary,
      colors.success,
      colors.warning,
      colors.danger,
      colors.neutral,
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
    const colors = this.getChartColors(mode);
    const userPalette = [
      colors.primary || "#3b82f6", // blue
      colors.success || "#10b981", // emerald/green
      colors.warning || "#f59e0b", // amber
      colors.danger || "#ef4444", // rose/red
      colors.secondary || "#8b5cf6", // purple
      "#ec4899", // pink (fallback)
      "#14b8a6", // teal (fallback)
      "#f97316", // orange (fallback)
    ];
    return userPalette[index % userPalette.length]!;
  }

  /**
   * Get category/industry colors
   * Used by: CRMDomain, KnowledgeDomain analytics
   */
  static getCategoryColors(mode: ThemeMode) {
    const colors = this.getChartColors(mode);
    return {
      tech: colors.primary || "#3b82f6",
      finance: colors.secondary || "#8b5cf6",
      healthcare: colors.success || "#10b981",
      legal: colors.primary || "#3b82f6",
      other: colors.neutral || "#6b7280",
    };
  }

  /**
   * Get jurisdiction type colors
   * Used by: Jurisdiction maps
   */
  static getJurisdictionColors(mode: ThemeMode) {
    const colors = this.getChartColors(mode);
    return {
      federal: colors.primary || "#3b82f6",
      state: colors.success || "#10b981",
    };
  }

  /**
   * Get entity type colors for graph visualizations
   * Used by: NexusGraph, GraphOverlay
   */
  static getEntityColors(mode: ThemeMode) {
    const colors = this.getChartColors(mode);

    return {
      case: mode === "dark" ? "#1e293b" : "#0f172a",
      individual: colors.primary || "#3b82f6",
      organization: colors.secondary || "#8b5cf6",
      evidence: colors.warning || "#f59e0b",
      document: colors.neutral || "#6b7280",
    };
  }

  /**
   * Get full palette as array (for components that need all colors)
   */
  static getPalette(mode: ThemeMode): string[] {
    const colors = this.getChartColors(mode);
    return [
      colors.primary,
      colors.secondary,
      colors.success,
      colors.warning,
      colors.danger,
      colors.neutral,
    ];
  }

  /**
   * Get Recharts tooltip style object
   * Used directly in Tooltip components
   */
  static getTooltipStyle(mode: ThemeMode) {
    const tokens = getTokens(mode);
    const tooltip = {
      bg: tokens.colors.surface,
      border: tokens.colors.border,
      text: tokens.colors.text,
    };
    return {
      backgroundColor: tooltip.bg,
      borderColor: tooltip.border,
      color: tooltip.text,
      borderRadius: tokens.borderRadius.md,
      border: `1px solid ${tooltip.border}`,
      boxShadow: tokens.shadows.md,
    };
  }
}
