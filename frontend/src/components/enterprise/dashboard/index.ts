/**
 * @module enterprise/dashboard
 * @category Enterprise Dashboard Components
 * @description Enterprise-grade dashboard components for LexiFlow Premium
 *
 * This module provides a comprehensive suite of dashboard widgets and components
 * designed for enterprise legal practice management with real-time metrics,
 * animated visualizations, and responsive design.
 */

// ============================================================================
// LEGACY DASHBOARD COMPONENTS
// ============================================================================

// KPI Card Component
export { KPICard } from "./KPICard";
export type { KPICardProps } from "./KPICard";

// Metrics Widget Component
export { MetricsWidget } from "./MetricsWidget";
export type { MetricItem, MetricsWidgetProps } from "./MetricsWidget";

// Revenue Overview Component
export { RevenueOverview } from "./RevenueOverview";
export type { RevenueDataPoint, RevenueOverviewProps } from "./RevenueOverview";

// Case Status Widget Component
export { CaseStatusWidget } from "./CaseStatusWidget";
export type { CaseStatusData, CaseStatusWidgetProps } from "./CaseStatusWidget";

// Team Productivity Widget Component
export { TeamProductivityWidget } from "./TeamProductivityWidget";
export type {
  TeamMember as DashboardTeamMember,
  TeamProductivityData,
  TeamProductivityWidgetProps,
} from "./TeamProductivityWidget";

// System Health Indicator Component
export { SystemHealthIndicator } from "./SystemHealthIndicator";
export type {
  HealthStatus,
  SystemHealthIndicatorProps,
  SystemService,
} from "./SystemHealthIndicator";

// ============================================================================
// ADVANCED DASHBOARD COMPONENTS
// ============================================================================

// Advanced Analytics Dashboard - Multi-chart analytics with various visualization types
export { AdvancedAnalyticsDashboard } from "./AdvancedAnalyticsDashboard";
export type { AdvancedAnalyticsDashboardProps } from "./AdvancedAnalyticsDashboard";

// Executive Summary Panel - High-level executive dashboard with comprehensive KPIs
export { ExecutiveSummaryPanel } from "./ExecutiveSummaryPanel";
export type { ExecutiveSummaryPanelProps } from "./ExecutiveSummaryPanel";

// Performance Metrics Grid - Detailed performance metrics with benchmarks and trends
export { PerformanceMetricsGrid } from "./PerformanceMetricsGrid";
export type { PerformanceMetricsGridProps } from "./PerformanceMetricsGrid";

// Real-Time Activity Feed - Live activity feed with real-time updates and filtering
export { RealTimeActivityFeed } from "./RealTimeActivityFeed";
export type { RealTimeActivityFeedProps } from "./RealTimeActivityFeed";

// Trend Analysis Widget - Advanced trend analysis with AI-powered predictions
export { TrendAnalysisWidget } from "./TrendAnalysisWidget";
export type { TrendAnalysisWidgetProps } from "./TrendAnalysisWidget";

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

// Error Boundary - Robust error boundary for dashboard components
export {
  DashboardErrorBoundary,
  useErrorHandler,
} from "./DashboardErrorBoundary";

// Skeleton Loaders - Professional loading states for all dashboard components
export {
  ActivityFeedSkeleton,
  ChartSkeleton,
  DashboardSkeleton,
  KPICardSkeleton,
  MetricsGridSkeleton,
  Skeleton,
  TableSkeleton,
  WidgetSkeleton,
} from "./DashboardSkeletonLoader";
