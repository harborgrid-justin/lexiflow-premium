/**
 * Analytics Module Types
 * Comprehensive type definitions for the analytics module
 *
 * @module types/analytics-module
 */

// ============================================================================
// Core Analytics Types
// ============================================================================

/**
 * Date range for analytics filtering
 */
export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

/**
 * Comparison period for YoY, MoM, WoW analysis
 */
export type ComparisonPeriod = 'yoy' | 'mom' | 'wow' | 'custom';

/**
 * Trend direction indicator
 */
export type TrendDirection = 'up' | 'down' | 'neutral';

/**
 * Trend data for metric cards
 */
export interface TrendData {
  direction: TrendDirection;
  value: number;
  period: string;
}

/**
 * Format types for metric display
 */
export type MetricFormat = 'number' | 'currency' | 'percentage' | 'duration';

/**
 * Color variants for UI elements
 */
export type MetricColor = 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'gray';

// ============================================================================
// Metric Card Types
// ============================================================================

/**
 * Data structure for metric card display
 */
export interface MetricCardData {
  label: string;
  value: number;
  format: MetricFormat;
  trend?: TrendData;
  icon?: string;
  color?: MetricColor;
  unit?: string;
  description?: string;
}

// ============================================================================
// Chart Types
// ============================================================================

/**
 * Generic chart data point
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

/**
 * Time series data point
 */
export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  label?: string;
}

/**
 * Pie chart segment
 */
export interface PieChartSegment {
  name: string;
  value: number;
  color: string;
  percentage?: number;
}

/**
 * Bar chart data item
 */
export interface BarChartItem {
  category: string;
  value: number;
  [key: string]: string | number;
}

// ============================================================================
// Case Analytics Types
// ============================================================================

/**
 * Case metrics summary
 */
export interface CaseMetricsSummary {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  wonCases: number;
  winRate: number;
  avgDuration: number;
  avgSettlement: number;
}

/**
 * Case outcome distribution
 */
export interface CaseOutcome {
  name: 'Won' | 'Lost' | 'Settled' | 'Active' | 'Dismissed';
  value: number;
  color: string;
}

/**
 * Case type breakdown
 */
export interface CaseTypeData {
  type: string;
  count: number;
  won: number;
  lost: number;
  settled: number;
  avgDuration: number;
}

/**
 * Case volume trend
 */
export interface CaseVolumeTrend {
  month: string;
  opened: number;
  closed: number;
  active: number;
}

/**
 * Attorney win rate data
 */
export interface AttorneyWinRate {
  name: string;
  cases: number;
  won: number;
  winRate: number;
}

// ============================================================================
// Client Analytics Types
// ============================================================================

/**
 * Client metrics summary
 */
export interface ClientMetricsSummary {
  totalClients: number;
  activeClients: number;
  newClients: number;
  avgClientValue: number;
  retentionRate: number;
  avgLifetime: number;
}

/**
 * Client revenue data
 */
export interface ClientRevenueData {
  client: string;
  revenue: number;
  profit: number;
  margin: number;
  cases: number;
}

/**
 * Client by industry
 */
export interface ClientIndustryData {
  industry: string;
  count: number;
  revenue: number;
  color: string;
}

/**
 * Client by size segment
 */
export interface ClientSizeData {
  size: 'Enterprise' | 'Large' | 'Medium' | 'Small';
  count: number;
  revenue: number;
  avgValue: number;
}

/**
 * Client engagement metrics
 */
export interface ClientEngagementData {
  client: string;
  satisfaction: number;
  activeMatters: number;
  totalMatters: number;
  lastContact?: string;
}

/**
 * Client retention cohort
 */
export interface RetentionCohort {
  cohort: string;
  retained: number;
  lost: number;
  rate: number;
}

// ============================================================================
// Productivity Analytics Types
// ============================================================================

/**
 * Productivity metrics summary
 */
export interface ProductivityMetricsSummary {
  totalHours: number;
  billableHours: number;
  utilizationRate: number;
  avgHoursPerDay: number;
  targetUtilization: number;
}

/**
 * Utilization trend data
 */
export interface UtilizationTrend {
  week: string;
  billable: number;
  nonBillable: number;
  utilization: number;
}

/**
 * Attorney performance data
 */
export interface AttorneyPerformance {
  name: string;
  billable: number;
  nonBillable: number;
  utilization: number;
  cases: number;
  docs: number;
}

/**
 * Activity breakdown
 */
export interface ActivityBreakdown {
  activity: string;
  hours: number;
  billable: boolean;
  percentage: number;
}

/**
 * Hourly comparison data
 */
export interface HourlyComparison {
  month: string;
  current: number;
  target: number;
  lastYear: number;
}

// ============================================================================
// Billing Analytics Types
// ============================================================================

/**
 * Billing metrics summary
 */
export interface BillingMetricsSummary {
  totalRevenue: number;
  collectedRevenue: number;
  outstandingAR: number;
  realizationRate: number;
  collectionRate: number;
  wipTotal: number;
  avgDaysToCollect: number;
}

/**
 * Revenue trend data
 */
export interface RevenueTrend {
  month: string;
  revenue: number;
  collected: number;
  billed: number;
  outstanding: number;
}

/**
 * Revenue by practice area
 */
export interface RevenueByPracticeArea {
  area: string;
  revenue: number;
  hours: number;
  avgRate: number;
}

/**
 * A/R aging bucket
 */
export interface ARAgingBucket {
  range: '0-30 Days' | '31-60 Days' | '61-90 Days' | '90+ Days';
  amount: number;
  count: number;
  percentage: number;
}

/**
 * Top billing attorney
 */
export interface TopBillingAttorney {
  name: string;
  revenue: number;
  hours: number;
  rate: number;
  realization: number;
}

/**
 * WIP by attorney
 */
export interface WIPByAttorney {
  name: string;
  amount: number;
  hours: number;
}

/**
 * Collection rate by client
 */
export interface CollectionRateByClient {
  client: string;
  billed: number;
  collected: number;
  rate: number;
}

// ============================================================================
// Dashboard Overview Types
// ============================================================================

/**
 * Dashboard overview metrics
 */
export interface DashboardOverview {
  cases: {
    total: number;
    active: number;
    winRate: number;
    trend: TrendData;
  };
  clients: {
    total: number;
    active: number;
    newThisMonth: number;
    trend: TrendData;
  };
  billing: {
    monthlyRevenue: number;
    ytdRevenue: number;
    outstanding: number;
    trend: TrendData;
  };
  productivity: {
    utilizationRate: number;
    billableHours: number;
    avgHoursPerDay: number;
    trend: TrendData;
  };
}

/**
 * Quick stats for dashboard
 */
export interface QuickStat {
  id: string;
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  href: string;
  icon: string;
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Analytics filter option
 */
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'daterange';
  options?: FilterOption[];
}

/**
 * Active filter values
 */
export type FilterValues = Record<string, string | string[] | DateRange | undefined>;

// ============================================================================
// Export Types
// ============================================================================

/**
 * Export format options
 */
export type ExportFormat = 'csv' | 'pdf' | 'xlsx';

/**
 * Export configuration
 */
export interface ExportConfig {
  format: ExportFormat;
  filename: string;
  dateRange?: DateRange;
  filters?: FilterValues;
  columns?: string[];
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Generic analytics API response
 */
export interface AnalyticsResponse<T> {
  data: T;
  metadata: {
    generatedAt: string;
    dateRange: DateRange;
    filters?: FilterValues;
  };
}

/**
 * Paginated analytics response
 */
export interface PaginatedAnalyticsResponse<T> extends AnalyticsResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
