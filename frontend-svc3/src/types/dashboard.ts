/**
 * @module types/dashboard
 * @category Dashboard Types
 * @description Comprehensive TypeScript types for enterprise dashboard components
 */

import { LucideIcon } from 'lucide-react';

// ============================================================================
// CORE DASHBOARD TYPES
// ============================================================================

export interface DashboardMetric {
  id: string;
  label: string;
  value: number | string;
  previousValue?: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  unit?: string;
  icon?: LucideIcon;
  color?: string;
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  target?: number;
  status?: 'success' | 'warning' | 'danger' | 'info';
}

export interface ExecutiveSummary {
  totalRevenue: number;
  revenueChange: number;
  totalCases: number;
  casesChange: number;
  activeCases: number;
  activeCasesChange: number;
  teamSize: number;
  averageEfficiency: number;
  efficiencyChange: number;
  billableHours: number;
  billableHoursChange: number;
  collectionRate: number;
  collectionRateChange: number;
  clientSatisfaction: number;
  satisfactionChange: number;
  upcomingDeadlines: number;
  overdueItems: number;
}

// ============================================================================
// ACTIVITY FEED TYPES
// ============================================================================

export type ActivityType =
  | 'case_created'
  | 'case_updated'
  | 'case_closed'
  | 'document_uploaded'
  | 'task_completed'
  | 'deadline_approaching'
  | 'payment_received'
  | 'team_member_added'
  | 'comment_added'
  | 'status_changed';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date | string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, unknown>;
  icon?: LucideIcon;
  color?: string;
  link?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface TimeSeriesDataPoint {
  timestamp: Date | string;
  value: number;
  label?: string;
  category?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: unknown;
}

export interface TrendData {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'neutral';
  prediction?: number;
  confidence?: number;
}

export interface AnalyticsWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'table' | 'map' | 'custom';
  data: unknown;
  config?: {
    chartType?: 'line' | 'bar' | 'area' | 'pie' | 'doughnut' | 'radar' | 'scatter';
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
    animated?: boolean;
    height?: number;
  };
  refreshInterval?: number;
  lastUpdated?: Date;
}

// ============================================================================
// PERFORMANCE METRICS TYPES
// ============================================================================

export interface PerformanceMetric {
  id: string;
  category: string;
  name: string;
  value: number;
  target?: number;
  benchmark?: number;
  unit: string;
  trend: TrendData;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  description?: string;
}

export interface TeamPerformance {
  teamId: string;
  teamName: string;
  metrics: {
    productivity: number;
    efficiency: number;
    quality: number;
    collaboration: number;
    innovation: number;
  };
  totalScore: number;
  rank: number;
  trend: 'improving' | 'stable' | 'declining';
}

// ============================================================================
// WIDGET CONFIGURATION TYPES
// ============================================================================

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  settings?: Record<string, unknown>;
  visible?: boolean;
  refreshInterval?: number;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  isDefault?: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

export interface DashboardFilters {
  dateRange?: {
    start: Date | string;
    end: Date | string;
  };
  caseTypes?: string[];
  statuses?: string[];
  assignees?: string[];
  priorities?: string[];
  tags?: string[];
  customFilters?: Record<string, unknown>;
}

export interface DashboardSearchParams {
  query?: string;
  filters?: DashboardFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ============================================================================
// DATA REFRESH TYPES
// ============================================================================

export interface RefreshConfig {
  enabled: boolean;
  interval: number; // milliseconds
  lastRefresh?: Date;
  nextRefresh?: Date;
}

export interface DataSource {
  id: string;
  name: string;
  endpoint: string;
  refreshConfig: RefreshConfig;
  status: 'active' | 'inactive' | 'error';
  lastError?: string;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sections?: string[];
  fileName?: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface DashboardAlert {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  dismissible: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoDismiss?: number; // milliseconds
}

// ============================================================================
// LOADING & ERROR STATES
// ============================================================================

/**
 * Loading state with progress tracking
 */
export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

/**
 * Error state with retry capability
 */
export interface ErrorState {
  hasError: boolean;
  error?: Error;
  message?: string;
  code?: string;
  retry?: () => void;
}

/**
 * Dashboard state - discriminated union for type safety
 */
export type DashboardState<TData = unknown> =
  | { status: 'idle' }
  | { status: 'loading'; progress?: number; message?: string }
  | { status: 'success'; data: TData; lastUpdated: Date }
  | { status: 'error'; error: Error; message?: string; code?: string; retry?: () => void };

/**
 * Type guard for success state
 */
export function isDashboardSuccess<T>(state: DashboardState<T>): state is { status: 'success'; data: T; lastUpdated: Date } {
  return state.status === 'success';
}

/**
 * Type guard for error state
 */
export function isDashboardError<T>(state: DashboardState<T>): state is { status: 'error'; error: Error; message?: string; code?: string; retry?: () => void } {
  return state.status === 'error';
}

/**
 * Type guard for loading state
 */
export function isDashboardLoading<T>(state: DashboardState<T>): state is { status: 'loading'; progress?: number; message?: string } {
  return state.status === 'loading';
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface BaseDashboardProps {
  className?: string;
  isLoading?: boolean;
  error?: ErrorState;
  onRefresh?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface WidgetProps extends BaseDashboardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}
