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
  type RevenueTrendChartProps,
  type RevenueDataPoint
} from './RevenueTrendChart';

export {
  CaseDistributionChart,
  type CaseDistributionChartProps,
  type CaseDistributionData
} from './CaseDistributionChart';

export {
  TeamPerformanceChart,
  type TeamPerformanceChartProps,
  type TeamMemberPerformance
} from './TeamPerformanceChart';

export {
  TimeSeriesChart,
  type TimeSeriesChartProps,
  type TimeSeriesDataPoint,
  type SeriesConfig,
  type ReferenceLine,
  type ReferenceAreaConfig
} from './TimeSeriesChart';

export {
  ComparisonChart,
  type ComparisonChartProps,
  type ComparisonDataPoint,
  type ComparisonType,
  type VisualizationType
} from './ComparisonChart';

// ============================================================================
// FILTER & EXPORT COMPONENTS
// ============================================================================

export {
  AnalyticsFilters,
  type AnalyticsFiltersProps,
  type AnalyticsFilterState,
  type DateRange,
  type DatePreset,
  type FilterOption,
  type FilterGroup
} from './AnalyticsFilters';

export {
  ReportExport,
  type ReportExportProps,
  type ExportFormat,
  type ExportOptions
} from './ReportExport';

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

export {
  MetricCard,
  type MetricCardProps
} from './MetricCard';

export {
  ChartCard,
  type ChartCardProps
} from './ChartCard';

export {
  DateRangeSelector,
  type DateRangeSelectorProps,
  type DateRange as DateRangeType,
  type DatePreset as DatePresetType
} from './DateRangeSelector';

export {
  FilterPanel,
  type FilterPanelProps
} from './FilterPanel';
