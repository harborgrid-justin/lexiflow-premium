/**
 * @module api/intelligence/legacy-dashboard-metrics.service
 * @category API Services
 * @description Dashboard metrics API service for fetching KPIs, analytics, and dashboard data (Enterprise Legacy)
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

import type { Deadline } from "@/routes/dashboard/widgets";
import type { Activity } from "@/types/dashboard";

// ============================================================================
// TYPES
// ============================================================================

export interface DashboardKPIs {
  activeCases: {
    value: number;
    previousValue: number;
    change: number;
    trend: "up" | "down" | "neutral";
    target?: number;
  };
  billableHours: {
    value: number;
    previousValue: number;
    change: number;
    trend: "up" | "down" | "neutral";
    target?: number;
  };
  revenue: {
    value: number;
    previousValue: number;
    change: number;
    trend: "up" | "down" | "neutral";
    target?: number;
  };
  upcomingDeadlines: {
    value: number;
    critical: number;
    thisWeek: number;
  };
  collectionRate: {
    value: number;
    previousValue: number;
    change: number;
    target?: number;
  };
  clientSatisfaction: {
    value: number;
    previousValue: number;
    change: number;
    target?: number;
  };
}

export interface CaseStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface BillingOverview {
  period: string;
  billed: number;
  collected: number;
  outstanding: number;
  writeOffs: number;
}

export interface RecentActivity extends Activity {}

export interface UpcomingDeadline extends Deadline {}

export interface TeamMetrics {
  userId: string;
  userName: string;
  billableHours: number;
  activeCases: number;
  completedTasks: number;
  efficiency: number;
}

export interface AttorneyDashboardData {
  kpis: {
    billableHours: {
      value: number;
      previousValue: number;
      target: number;
    };
    activeCases: {
      value: number;
      previousValue: number;
    };
    utilizationRate: {
      value: number;
      previousValue: number;
    };
    upcomingDeadlines: {
      value: number;
      subtitle: string;
    };
  };
  dailyBillableHours: {
    day: string;
    hours: number;
  }[];
}

export interface PartnerDashboardData {
  kpis: {
    monthlyRevenue: {
      value: number;
      previousValue: number;
      target: number;
    };
    newClients: {
      value: number;
      previousValue: number;
    };
    winRate: {
      value: number;
      previousValue: number;
    };
    clientRetention: {
      value: number;
      previousValue: number;
    };
  };
  revenueTrends: {
    month: string;
    revenue: number;
    target: number;
  }[];
  caseOutcomes: {
    outcome: string;
    count: number;
  }[];
  businessMetrics: {
    avgCaseValue: {
      value: number;
      change: number;
    };
    cac: {
      value: number;
      change: number;
    };
    nps: {
      value: number;
      change: number;
    };
  };
}

export interface AdminDashboardData {
  kpis: {
    totalUsers: {
      value: number;
      previousValue: number;
    };
    activeUsers: {
      value: number;
      subtitle: string;
    };
    systemHealth: {
      value: number;
      previousValue: number;
    };
    openIssues: {
      value: number;
      subtitle: string;
    };
  };
  userActivity: {
    date: string;
    users: number;
    actions: number;
  }[];
  systemStats: {
    storageUsage: {
      value: number;
      total: number;
      unit: string;
    };
    apiLatency: {
      value: number;
      unit: string;
    };
    errorRate: {
      value: number;
      unit: string;
    };
  };
}

export interface DashboardFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  caseTypes?: string[];
  departments?: string[];
  users?: string[];
}

// ============================================================================
// SERVICE
// ============================================================================

export class DashboardMetricsService {
  private readonly baseUrl = "/api/dashboard";

  /**
   * Get executive summary KPIs
   */
  async getKPIs(filters?: DashboardFilters): Promise<DashboardKPIs> {
    const params = filters
      ? new URLSearchParams(filters as unknown as Record<string, string>)
      : undefined;
    return apiClient.get<DashboardKPIs>(
      `${this.baseUrl}/kpis${params ? `?${params}` : ""}`
    );
  }

  /**
   * Get case status breakdown
   */
  async getCaseStatusBreakdown(
    filters?: DashboardFilters
  ): Promise<CaseStatusBreakdown[]> {
    const params = filters
      ? new URLSearchParams(filters as unknown as Record<string, string>)
      : undefined;
    return apiClient.get<CaseStatusBreakdown[]>(
      `${this.baseUrl}/cases/status-breakdown${params ? `?${params}` : ""}`
    );
  }

  /**
   * Get billing overview
   */
  async getBillingOverview(
    filters?: DashboardFilters
  ): Promise<BillingOverview[]> {
    const params = filters
      ? new URLSearchParams(filters as unknown as Record<string, string>)
      : undefined;
    return apiClient.get<BillingOverview[]>(
      `${this.baseUrl}/billing/overview${params ? `?${params}` : ""}`
    );
  }

  /**
   * Get recent activity feed
   */
  async getRecentActivity(limit = 20): Promise<RecentActivity[]> {
    return apiClient.get<RecentActivity[]>(
      `${this.baseUrl}/activity/recent?limit=${limit}`
    );
  }

  /**
   * Get upcoming deadlines
   */
  async getUpcomingDeadlines(filters?: {
    days?: number;
    priority?: string[];
  }): Promise<UpcomingDeadline[]> {
    const params = new URLSearchParams();
    if (filters?.days) params.append("days", String(filters.days));
    if (filters?.priority)
      filters.priority.forEach((p) => params.append("priority", p));

    return apiClient.get<UpcomingDeadline[]>(
      `${this.baseUrl}/deadlines/upcoming${params.toString() ? `?${params}` : ""}`
    );
  }

  /**
   * Get team performance metrics
   */
  async getTeamMetrics(filters?: DashboardFilters): Promise<TeamMetrics[]> {
    const params = filters
      ? new URLSearchParams(filters as unknown as Record<string, string>)
      : undefined;
    return apiClient.get<TeamMetrics[]>(
      `${this.baseUrl}/team/metrics${params ? `?${params}` : ""}`
    );
  }

  /**
   * Get role-specific dashboard data
   */
  async getRoleDashboard(
    role: "attorney" | "paralegal" | "admin" | "partner"
  ): Promise<
    | AttorneyDashboardData
    | PartnerDashboardData
    | AdminDashboardData
    | Record<string, unknown>
  > {
    return apiClient.get(`${this.baseUrl}/role/${role}`);
  }

  /**
   * Export dashboard data
   */
  async exportDashboard(
    format: "pdf" | "excel" | "csv",
    filters?: DashboardFilters
  ): Promise<Blob> {
    const params = filters
      ? new URLSearchParams(filters as unknown as Record<string, string>)
      : undefined;
    return apiClient.get<Blob>(
      `${this.baseUrl}/export/${format}${params ? `?${params}` : ""}`
    );
  }

  /**
   * Get AR aging collection items
   */
  async getCollectionItems(): Promise<
    Array<{
      id: string;
      clientName: string;
      invoiceNumber: string;
      amount: number;
      daysOverdue: number;
      lastContactDate?: string;
      assignedTo?: string;
      priority: "high" | "medium" | "low";
      status: "pending" | "in_progress" | "contacted" | "payment_plan";
    }>
  > {
    return apiClient.get<
      Array<{
        id: string;
        clientName: string;
        invoiceNumber: string;
        amount: number;
        daysOverdue: number;
        lastContactDate?: string;
        assignedTo?: string;
        priority: "high" | "medium" | "low";
        status: "pending" | "in_progress" | "contacted" | "payment_plan";
      }>
    >(`${this.baseUrl}/billing/collections`);
  }

  /**
   * Get write-off requests
   */
  async getWriteOffRequests(): Promise<
    Array<{
      id: string;
      invoiceNumber: string;
      clientName: string;
      originalAmount: number;
      writeOffAmount: number;
      reason: string;
      requestedBy: string;
      requestedDate: string;
      status: "pending" | "approved" | "rejected";
    }>
  > {
    return apiClient.get<
      Array<{
        id: string;
        invoiceNumber: string;
        clientName: string;
        originalAmount: number;
        writeOffAmount: number;
        reason: string;
        requestedBy: string;
        requestedDate: string;
        status: "pending" | "approved" | "rejected";
      }>
    >(`${this.baseUrl}/billing/writeoffs`);
  }
}

// Export singleton instance
export const dashboardMetricsService = new DashboardMetricsService();
