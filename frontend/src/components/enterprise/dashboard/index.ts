/**
 * @module enterprise/dashboard
 * @category Enterprise Dashboard Components
 * @description Enterprise-grade dashboard components for LexiFlow Premium
 *
 * This module provides a comprehensive suite of dashboard widgets and components
 * designed for enterprise legal practice management with real-time metrics,
 * animated visualizations, and responsive design.
 */

// KPI Card Component
export { KPICard } from './KPICard';
export type { KPICardProps } from './KPICard';

// Metrics Widget Component
export { MetricsWidget } from './MetricsWidget';
export type { MetricsWidgetProps, MetricItem } from './MetricsWidget';

// Revenue Overview Component
export { RevenueOverview } from './RevenueOverview';
export type { RevenueOverviewProps, RevenueDataPoint } from './RevenueOverview';

// Case Status Widget Component
export { CaseStatusWidget } from './CaseStatusWidget';
export type { CaseStatusWidgetProps, CaseStatusData } from './CaseStatusWidget';

// Team Productivity Widget Component
export { TeamProductivityWidget } from './TeamProductivityWidget';
export type {
  TeamProductivityWidgetProps,
  TeamMember,
  TeamProductivityData,
} from './TeamProductivityWidget';

// System Health Indicator Component
export { SystemHealthIndicator } from './SystemHealthIndicator';
export type {
  SystemHealthIndicatorProps,
  SystemService,
  HealthStatus,
} from './SystemHealthIndicator';
