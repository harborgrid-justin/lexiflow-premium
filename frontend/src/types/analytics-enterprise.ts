/**
 * Enterprise Analytics Types
 * Advanced analytics, metrics, and reporting interfaces for legal platform
 */

import { BaseEntity } from './primitives';

// ====================
METRIC CARDS ====================

export interface MetricCardData {
  label: string;
  value: number | string;
  unit?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: number;
    period: string;
  };
  icon?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  format?: 'number' | 'currency' | 'percentage' | 'duration';
}

// ====================
CASE ANALYTICS ====================

export interface CaseAnalytics {
  period: { start: string; end: string };
  overview: {
    totalCases: number;
    activeCases: number;
    closedCases: number;
    wonCases: number;
    lostCases: number;
    settledCases: number;
    winRate: number;
    avgCaseDuration: number;
    avgCaseValue: number;
  };
  byType: Array<{
    type: string;
    count: number;
    avgDuration: number;
    winRate: number;
  }>;
  byStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  byPracticeArea: Array<{
    area: string;
    count: number;
    revenue: number;
    winRate: number;
  }>;
  outcomes: Array<{
    outcome: 'won' | 'lost' | 'settled' | 'dismissed' | 'pending';
    count: number;
    percentage: number;
    avgValue: number;
  }>;
  timeline: Array<{
    date: string;
    opened: number;
    closed: number;
    active: number;
  }>;
}

// ====================
BILLING ANALYTICS ====================

export interface BillingAnalytics {
  period: { start: string; end: string };
  revenue: {
    total: number;
    billed: number;
    collected: number;
    outstanding: number;
    writeOffs: number;
  };
  realization: {
    rate: number;
    billedHours: number;
    collectedHours: number;
    targetRate: number;
  };
  collection: {
    rate: number;
    avgDaysToCollect: number;
    currentAR: number;
  };
  byAttorney: Array<{
    userId: string;
    userName: string;
    hoursBilled: number;
    hoursWorked: number;
    revenue: number;
    collected: number;
    realizationRate: number;
    utilizationRate: number;
  }>;
  byClient: Array<{
    clientId: string;
    clientName: string;
    revenue: number;
    outstanding: number;
    avgPaymentDays: number;
    profitability: number;
  }>;
  byPracticeArea: Array<{
    area: string;
    revenue: number;
    hours: number;
    avgRate: number;
  }>;
  aging: Array<{
    range: '0-30' | '31-60' | '61-90' | '90+';
    amount: number;
    count: number;
    percentage: number;
  }>;
  wip: {
    total: number;
    byAttorney: Array<{
      userId: string;
      userName: string;
      amount: number;
      hours: number;
    }>;
  };
  trend: Array<{
    month: string;
    revenue: number;
    collected: number;
    billed: number;
    outstanding: number;
  }>;
}

// ====================
PRODUCTIVITY ANALYTICS ====================

export interface ProductivityAnalytics {
  period: { start: string; end: string };
  overview: {
    totalHours: number;
    billableHours: number;
    nonBillableHours: number;
    utilizationRate: number;
    avgHoursPerDay: number;
  };
  byAttorney: Array<{
    userId: string;
    userName: string;
    role: string;
    totalHours: number;
    billableHours: number;
    utilizationRate: number;
    avgRate: number;
    casesHandled: number;
    documentsCreated: number;
    tasksCompleted: number;
  }>;
  byActivity: Array<{
    activity: string;
    hours: number;
    percentage: number;
    billable: boolean;
  }>;
  timeline: Array<{
    date: string;
    hours: number;
    billableHours: number;
    utilizationRate: number;
  }>;
  comparison: {
    type: 'YoY' | 'MoM' | 'QoQ';
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
}

// ====================
CLIENT ANALYTICS ====================

export interface ClientAnalytics {
  period: { start: string; end: string };
  overview: {
    totalClients: number;
    activeClients: number;
    newClients: number;
    avgClientValue: number;
    avgClientLifetime: number;
    retentionRate: number;
  };
  byProfitability: Array<{
    clientId: string;
    clientName: string;
    revenue: number;
    costs: number;
    profit: number;
    profitMargin: number;
    casesActive: number;
  }>;
  byIndustry: Array<{
    industry: string;
    count: number;
    revenue: number;
    avgValue: number;
  }>;
  bySize: Array<{
    size: 'small' | 'medium' | 'large' | 'enterprise';
    count: number;
    revenue: number;
  }>;
  engagement: Array<{
    clientId: string;
    clientName: string;
    lastActivity: string;
    totalMatters: number;
    activeMatters: number;
    satisfactionScore: number;
  }>;
  retention: Array<{
    cohort: string;
    retained: number;
    lost: number;
    retentionRate: number;
  }>;
}

// ====================
REPORTS ====================

export interface Report extends BaseEntity {
  name: string;
  description?: string;
  type: ReportType;
  category: ReportCategory;
  schedule?: ReportSchedule;
  format: ReportFormat[];
  parameters: ReportParameters;
  recipients?: string[];
  lastRun?: string;
  nextRun?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  template?: string;
}

export type ReportType =
  | 'case-summary'
  | 'billing-summary'
  | 'productivity'
  | 'client-profitability'
  | 'ar-aging'
  | 'wip-report'
  | 'realization'
  | 'custom';

export type ReportCategory =
  | 'financial'
  | 'operational'
  | 'compliance'
  | 'performance'
  | 'executive';

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'html';

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time?: string;
  timezone?: string;
}

export interface ReportParameters {
  dateRange: {
    type: 'relative' | 'absolute';
    start?: string;
    end?: string;
    period?: string;
  };
  filters?: {
    clients?: string[];
    attorneys?: string[];
    practiceAreas?: string[];
    caseTypes?: string[];
    statuses?: string[];
  };
  groupBy?: string[];
  sortBy?: {
    field: string;
    order: 'asc' | 'desc';
  }[];
  includeCharts?: boolean;
  includeSummary?: boolean;
}

export interface ReportData {
  report: Report;
  generatedAt: string;
  data: unknown;
  charts?: ChartData[];
  summary?: Record<string, unknown>;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  title: string;
  data: unknown[];
  config?: Record<string, unknown>;
}

// ====================
AUDIT LOGS ====================

export interface AuditLog extends BaseEntity {
  userId?: string;
  userName?: string;
  userEmail?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  entityName?: string;
  changes?: AuditChange[];
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: AuditCategory;
  metadata?: Record<string, unknown>;
}

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'access_denied'
  | 'export'
  | 'import'
  | 'share'
  | 'download'
  | 'upload'
  | 'approve'
  | 'reject'
  | 'restore'
  | 'archive';

export type AuditCategory =
  | 'authentication'
  | 'authorization'
  | 'data_access'
  | 'data_modification'
  | 'system_config'
  | 'security'
  | 'compliance';

export interface AuditChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface AuditLogFilters {
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: AuditAction;
  category?: AuditCategory;
  severity?: string[];
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

// ====================
DASHBOARD WIDGETS ====================

export interface AnalyticsDashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'list' | 'heatmap' | 'gauge';
  title: string;
  subtitle?: string;
  dataSource: string;
  refreshInterval?: number;
  position: { x: number; y: number; w: number; h: number };
  config: WidgetConfig;
}

export interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  metric?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  groupBy?: string;
  filters?: Record<string, unknown>;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  animation?: boolean;
}

// ====================
TIME SERIES ====================

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface ComparisonData {
  label: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'neutral';
}
