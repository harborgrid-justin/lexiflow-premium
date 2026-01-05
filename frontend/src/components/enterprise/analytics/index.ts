/**
 * @module components/enterprise/analytics
 * @category Enterprise Analytics
 * @description Enterprise analytics visualization and reporting components.
 *
 * This module provides a comprehensive suite of analytics components for
 * enterprise dashboards, including charts, filters, and export functionality.
 */

// ============================================================================
// CHART COMPONENTS
// ============================================================================

export {
  RevenueTrendChart,
  type RevenueDataPoint as AnalyticsRevenueDataPoint,
  type RevenueTrendChartProps,
} from "./RevenueTrendChart";

export {
  CaseDistributionChart,
  type CaseDistributionChartProps,
  type CaseDistributionData,
} from "./CaseDistributionChart";

export {
  TeamPerformanceChart,
  type TeamMemberPerformance,
  type TeamPerformanceChartProps,
} from "./TeamPerformanceChart";

export {
  TimeSeriesChart,
  type ReferenceAreaConfig,
  type ReferenceLine,
  type SeriesConfig,
  type TimeSeriesChartProps,
  type TimeSeriesDataPoint,
} from "./TimeSeriesChart";

export {
  ComparisonChart,
  type ComparisonChartProps,
  type ComparisonDataPoint,
  type ComparisonType,
  type VisualizationType,
} from "./ComparisonChart";

// ============================================================================
// FILTER & EXPORT COMPONENTS
// ============================================================================

export {
  AnalyticsFilters,
  type AnalyticsFilterState,
  type AnalyticsFiltersProps,
  type DatePreset,
  type DateRange,
  type FilterGroup,
  type FilterOption,
} from "./AnalyticsFilters";

export {
  ReportExport,
  type ExportOptions as AnalyticsExportOptions,
  type ExportFormat,
  type ReportExportProps,
} from "./ReportExport";

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

export { MetricCard, type MetricCardProps } from "./MetricCard";

export { ChartCard, type ChartCardProps } from "./ChartCard";

export {
  DateRangeSelector,
  type DatePreset as DatePresetType,
  type DateRangeSelectorProps,
  type DateRange as DateRangeType,
} from "./DateRangeSelector";

export { FilterPanel, type FilterPanelProps } from "./FilterPanel";
