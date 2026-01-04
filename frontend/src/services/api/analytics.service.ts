/**
 * @module services/api/analytics.service
 * @category API Services
 * @description Comprehensive analytics API service for enterprise analytics widgets and dashboards
 */

import { apiClient } from "@/services/infrastructure/apiClient";

// ============================================================================
// TYPES - Analytics Data Structures
// ============================================================================

export interface CaseTrendData {
  month: string;
  opened: number;
  closed: number;
  won: number;
  lost: number;
  settled: number;
  winRate: number;
}

export interface BillingTrendData {
  month: string;
  billed: number;
  collected: number;
  outstanding: number;
  writeOffs: number;
  realizationRate: number;
}

export interface AttorneyUtilizationData {
  name: string;
  billable: number;
  nonBillable: number;
  admin: number;
  utilizationRate: number;
}

export interface ClientAcquisitionData {
  month: string;
  newClients: number;
  lostClients: number;
  totalActive: number;
  retentionRate: number;
  avgLifetimeValue: number;
}

export interface ARAgingData {
  range: string;
  amount: number;
  count: number;
  percentage: number;
  [key: string]: string | number;
}

export interface PracticeAreaPerformanceData {
  area: string;
  revenue: number;
  cases: number;
  winRate: number;
  avgCaseValue: number;
  utilizationRate: number;
}

export interface KPIDto {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  changePercentage?: number;
  target?: number;
  unit?: string;
  trend?: "up" | "down" | "stable";
}

export interface CaseMetrics {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  pendingCases: number;
  winRate: number;
  avgSettlement: number;
  casesByType: Record<string, number>;
  casesByStatus: Record<string, number>;
  timeline: Array<{ date: string; count: number }>;
}

export interface FinancialMetrics {
  totalRevenue: number;
  outstandingReceivables: number;
  collectedRevenue: number;
  totalBillableHours: number;
  averageHourlyRate: number;
  revenueByPracticeArea: Record<string, number>;
  collectionRate?: number;
  revenueGrowth?: number;
  outstandingInvoicesCount?: number;
  revenueTimeline?: Array<{ date: string; revenue: number }>;
}

export interface TeamMember {
  userId: string;
  userName: string;
  billableHours: number;
  casesHandled: number;
  revenueGenerated: number;
  utilizationRate?: number;
  averageCaseDuration?: number;
}

export interface TeamPerformance {
  teamMembers: TeamMember[];
  overallUtilizationRate: number;
  totalBillableHours: number;
  totalRevenue: number;
  topPerformerId?: string;
  performanceTimeline?: Array<{ date: string; hours: number }>;
}

export interface ClientMetric {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  activeCases: number;
  outstandingBalance: number;
  lifetimeValue?: number;
  lastActivityDate?: string;
}

export interface ClientMetrics {
  clients: ClientMetric[];
  totalActiveClients: number;
  totalRevenue: number;
  averageLifetimeValue?: number;
  topClientId?: string;
  totalClients?: number;
  activeClients?: number;
  newClients?: number;
  retentionRate?: number;
  avgClientValue?: number;
  clientsByIndustry?: Record<string, number>;
  satisfactionScores?: Array<{ date: string; score: number }>;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ChartData {
  chartType: string;
  data: ChartDataPoint[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  labels?: string[];
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  caseType?: string;
  teamId?: string;
  period?: string;
}

// ============================================================================
// SERVICE
// ============================================================================

export class AnalyticsService {
  private readonly baseUrl = "/api/analytics/dashboard";

  /**
   * Get KPIs with optional filters
   */
  async getKPIs(
    filters?: AnalyticsFilters
  ): Promise<{ kpis: KPIDto[]; period: string }> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(`${this.baseUrl}/kpis${params}`);
  }

  /**
   * Get case metrics
   */
  async getCaseMetrics(filters?: AnalyticsFilters): Promise<CaseMetrics> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(`${this.baseUrl}/cases/metrics${params}`);
  }

  /**
   * Get financial metrics
   */
  async getFinancialMetrics(
    filters?: AnalyticsFilters
  ): Promise<FinancialMetrics> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(`${this.baseUrl}/financial${params}`);
  }

  /**
   * Get team performance
   */
  async getTeamPerformance(
    filters?: AnalyticsFilters
  ): Promise<TeamPerformance> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(`${this.baseUrl}/team/performance${params}`);
  }

  /**
   * Get client metrics
   */
  async getClientMetrics(filters?: AnalyticsFilters): Promise<ClientMetrics> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(`${this.baseUrl}/clients/metrics${params}`);
  }

  /**
   * Get chart data by type
   */
  async getChartData(
    chartType: string,
    filters?: AnalyticsFilters
  ): Promise<ChartData> {
    const params = this.buildQueryParams(filters);
    return apiClient.get(`${this.baseUrl}/charts/${chartType}${params}`);
  }

  /**
   * Get case trends (mapped to chart data)
   */
  async getCaseTrends(filters?: AnalyticsFilters): Promise<CaseTrendData[]> {
    const params = this.buildQueryParams(filters);
    const response = await apiClient.get<{ data: any[] }>(
      `${this.baseUrl}/charts/case-trends${params}`
    );
    return this.mapToCaseTrends(response.data || []);
  }

  /**
   * Get billing trends
   */
  async getBillingTrends(
    filters?: AnalyticsFilters
  ): Promise<BillingTrendData[]> {
    const params = this.buildQueryParams(filters);
    const response = await apiClient.get<{ data: any[] }>(
      `${this.baseUrl}/charts/billing-trends${params}`
    );
    return this.mapToBillingTrends(response.data || []);
  }

  /**
   * Get attorney utilization
   */
  async getAttorneyUtilization(
    filters?: AnalyticsFilters
  ): Promise<AttorneyUtilizationData[]> {
    const teamPerformance = await this.getTeamPerformance(filters);
    return this.mapToAttorneyUtilization(teamPerformance.teamMembers);
  }

  /**
   * Get client acquisition data
   */
  async getClientAcquisition(
    filters?: AnalyticsFilters
  ): Promise<ClientAcquisitionData[]> {
    const params = this.buildQueryParams(filters);
    const response = await apiClient.get<{ data: any[] }>(
      `${this.baseUrl}/charts/client-acquisition${params}`
    );
    return this.mapToClientAcquisition(response.data || []);
  }

  /**
   * Get AR aging data
   */
  async getARAgingData(filters?: AnalyticsFilters): Promise<ARAgingData[]> {
    const params = this.buildQueryParams(filters);
    const response = await apiClient.get<{ data: any[] }>(
      `${this.baseUrl}/charts/ar-aging${params}`
    );
    return this.mapToARAgingData(response.data || []);
  }

  /**
   * Get practice area performance
   */
  async getPracticeAreaPerformance(
    filters?: AnalyticsFilters
  ): Promise<PracticeAreaPerformanceData[]> {
    const financialMetrics = await this.getFinancialMetrics(filters);
    return this.mapToPracticeAreaPerformance(
      financialMetrics.revenueByPracticeArea
    );
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private buildQueryParams(filters?: AnalyticsFilters): string {
    if (!filters) return "";
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  }

  private mapToCaseTrends(data: any[]): CaseTrendData[] {
    return data.map((item) => ({
      month: item.label || item.month || "",
      opened: item.opened || 0,
      closed: item.closed || 0,
      won: item.won || 0,
      lost: item.lost || 0,
      settled: item.settled || 0,
      winRate: item.winRate || 0,
    }));
  }

  private mapToBillingTrends(data: any[]): BillingTrendData[] {
    return data.map((item) => ({
      month: item.label || item.month || "",
      billed: item.billed || 0,
      collected: item.collected || 0,
      outstanding: item.outstanding || 0,
      writeOffs: item.writeOffs || 0,
      realizationRate: item.realizationRate || 0,
    }));
  }

  private mapToAttorneyUtilization(
    teamMembers: TeamMember[]
  ): AttorneyUtilizationData[] {
    return teamMembers.map((member) => ({
      name: member.userName,
      billable: member.billableHours,
      nonBillable: 0, // Not in API response
      admin: 0, // Not in API response
      utilizationRate: member.utilizationRate || 0,
    }));
  }

  private mapToClientAcquisition(data: any[]): ClientAcquisitionData[] {
    return data.map((item) => ({
      month: item.label || item.month || "",
      newClients: item.newClients || 0,
      lostClients: item.lostClients || 0,
      totalActive: item.totalActive || 0,
      retentionRate: item.retentionRate || 0,
      avgLifetimeValue: item.avgLifetimeValue || 0,
    }));
  }

  private mapToARAgingData(data: any[]): ARAgingData[] {
    return data.map((item) => ({
      range: item.label || item.range || "",
      amount: item.amount || item.value || 0,
      count: item.count || 0,
      percentage: item.percentage || 0,
    }));
  }

  private mapToPracticeAreaPerformance(
    revenueByPracticeArea: Record<string, number>
  ): PracticeAreaPerformanceData[] {
    return Object.entries(revenueByPracticeArea).map(([area, revenue]) => ({
      area,
      revenue,
      cases: 0, // Not available in current API
      winRate: 0, // Not available in current API
      avgCaseValue: 0, // Not available in current API
      utilizationRate: 0, // Not available in current API
    }));
  }
}

export const analyticsService = new AnalyticsService();
