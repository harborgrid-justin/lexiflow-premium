/**
 * @deprecated This module has been moved to @/features/theme/services/chartColorService
 * Please update your imports:
 *
 * Old: import { ChartColorService } from '@/services/theme/chartColorService';
 * New: import { ChartColorService } from '@/features/theme';
 *
 * This re-export will be removed in a future version.
 */

// Re-export from centralized location
export { ChartColorService } from "@/features/theme/services/chartColorService";

export class ChartColorService {
  /**
   * Get all chart colors for the current theme mode
   */
  static getChartColors(_mode: ThemeMode) {
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
  static getStatusColors(_mode: ThemeMode) {
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
    const colors = this.getChartColors(mode);
    return {
      grid: mode === "dark" ? "#374151" : "#e5e7eb",
      text: mode === "dark" ? "#9ca3af" : "#6b7280",
      tooltip: {
        bg: mode === "dark" ? "#1f2937" : "#ffffff",
        border: mode === "dark" ? "#374151" : "#e5e7eb",
        text: mode === "dark" ? "#f3f4f6" : "#111827",
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
    const tooltip = {
      bg: mode === "dark" ? "#1f2937" : "#ffffff",
      border: mode === "dark" ? "#374151" : "#e5e7eb",
      text: mode === "dark" ? "#f3f4f6" : "#111827",
    };
    return {
      backgroundColor: tooltip.bg,
      borderColor: tooltip.border,
      color: tooltip.text,
      borderRadius: "8px",
      border: "none",
      boxShadow:
        mode === "dark"
          ? "0 4px 6px -1px rgb(0 0 0 / 0.3)"
          : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    };
  }
}
