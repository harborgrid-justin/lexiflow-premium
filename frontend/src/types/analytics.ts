// types/analytics.ts
// Analytics and Integrations types

import { type BaseEntity, type MetadataRecord } from "./primitives";

// ====================
// ANALYTICS ====================

export interface AnalyticsEvent extends BaseEntity {
  eventType: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  timestamp: string;
  metadata?: MetadataRecord;
}

export interface Dashboard extends BaseEntity {
  userId: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout?: AnalyticsDashboardLayout;
  isPublic: boolean;
}

export interface DashboardWidget {
  id: string;
  type: "chart" | "metric" | "table" | "list" | "calendar" | "timeline";
  title: string;
  config: MetadataRecord;
  dataSource?: {
    type: string;
    query?: string;
    filters?: MetadataRecord;
  };
}

export interface AnalyticsDashboardLayout {
  columns: number;
  rows: number;
  widgets: {
    widgetId: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}

export interface MetricData {
  name: string;
  value: number;
  timestamp: string;
  unit?: string;
  dimensions?: Record<string, string>;
  metadata?: MetadataRecord;
}

export interface TimeSeriesData {
  timestamp: string;
  count: number;
  metadata?: MetadataRecord;
}

export interface AnalyticsDataPoint {
  name: string;
  count: number;
}

export interface CaseMetrics {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  winRate: number;
  avgCaseDuration: number;
  casesByType: Record<string, number>;
  casesByStatus: Record<string, number>;
}

export interface UserActivityMetrics {
  activeUsers: number;
  totalSessions: number;
  avgSessionDuration: number;
  topUsers: Array<{
    userId: string;
    userName: string;
    actionCount: number;
  }>;
  activityByType: Record<string, number>;
}

export interface BillingMetrics {
  totalRevenue: number;
  outstandingInvoices: number;
  avgCollectionTime: number;
  revenueByClient: Record<string, number>;
  revenueByType: Record<string, number>;
  utilizationRate: number;
}

// ====================
// INTEGRATIONS ====================

export interface Integration extends BaseEntity {
  name: string;
  type: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  config?: MetadataRecord;
  credentials?: {
    accessToken?: string;
    refreshToken?: string;
    apiKey?: string;
    secret?: string;
  };
  syncEnabled: boolean;
  lastSyncedAt?: string;
  metadata?: MetadataRecord;
}

export type IntegrationProvider =
  | "pacer"
  | "clio"
  | "westlaw"
  | "lexisnexis"
  | "dropbox"
  | "box"
  | "onedrive"
  | "google_drive"
  | "slack"
  | "microsoft_teams"
  | "quickbooks"
  | "xero"
  | "salesforce"
  | "hubspot"
  | "zoom"
  | "docusign"
  | "custom";

export type IntegrationStatus =
  | "active"
  | "inactive"
  | "error"
  | "disconnected"
  | "pending_auth"
  | "expired";

export interface IntegrationCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt?: string;
}

export interface IntegrationSyncResult {
  integrationId: string;
  status: "success" | "error" | "partial";
  itemsSynced: number;
  errors?: string[];
  syncedAt: string;
  duration: number;
}

export interface IntegrationConnection {
  integrationId: string;
  connected: boolean;
  lastChecked: string;
  message?: string;
}
