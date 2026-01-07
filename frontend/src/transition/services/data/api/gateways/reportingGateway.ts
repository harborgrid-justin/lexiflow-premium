/**
 * Reporting Gateway
 *
 * Domain-specific wrapper for analytics and reporting operations.
 * Handles report generation, data visualization, and business intelligence.
 *
 * @module services/data/api/gateways/reportingGateway
 */

import { authGet, authPost } from "../../client/authTransport";

// Domain types
export interface Report {
  id: string;
  name: string;
  type:
    | "financial"
    | "operational"
    | "case-analysis"
    | "time-tracking"
    | "custom";
  status: "generating" | "completed" | "failed";
  parameters: Record<string, any>;
  data: any;
  generatedAt: string;
  generatedBy: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  parameters: ReportParameter[];
}

export interface ReportParameter {
  name: string;
  type: "string" | "number" | "date" | "daterange" | "select";
  label: string;
  required: boolean;
  options?: { label: string; value: any }[];
}

export interface AnalyticsSummary {
  casesTotal: number;
  casesActive: number;
  casesClosed: number;
  revenue: number;
  hoursLogged: number;
  utilizationRate: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

/**
 * Reporting Gateway
 */
export const reportingGateway = {
  /**
   * Get all reports
   */
  async getAllReports(): Promise<Report[]> {
    return authGet<Report[]>("/reports");
  },

  /**
   * Get report by ID
   */
  async getReportById(id: string): Promise<Report> {
    return authGet<Report>(`/reports/${id}`);
  },

  /**
   * Generate new report
   */
  async generateReport(
    type: string,
    parameters: Record<string, any>
  ): Promise<Report> {
    return authPost<Report>("/reports/generate", { type, parameters });
  },

  /**
   * Get report templates
   */
  async getTemplates(): Promise<ReportTemplate[]> {
    return authGet<ReportTemplate[]>("/reports/templates");
  },

  /**
   * Export report in specific format
   */
  async exportReport(
    id: string,
    format: "pdf" | "csv" | "xlsx"
  ): Promise<Blob> {
    return authGet<Blob>(`/reports/${id}/export`, { params: { format } });
  },

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(dateRange?: {
    start: string;
    end: string;
  }): Promise<AnalyticsSummary> {
    return authGet<AnalyticsSummary>("/analytics/summary", {
      params: dateRange,
    });
  },

  /**
   * Get time series data for charts
   */
  async getTimeSeriesData(
    metric: string,
    dateRange: { start: string; end: string }
  ): Promise<TimeSeriesData[]> {
    return authGet<TimeSeriesData[]>("/analytics/timeseries", {
      params: { metric, ...dateRange },
    });
  },

  /**
   * Get case distribution by status
   */
  async getCaseDistribution(): Promise<Record<string, number>> {
    return authGet<Record<string, number>>("/analytics/cases/distribution");
  },

  /**
   * Get revenue breakdown
   */
  async getRevenueBreakdown(
    period: "month" | "quarter" | "year"
  ): Promise<any> {
    return authGet<any>("/analytics/revenue/breakdown", { params: { period } });
  },

  /**
   * Get top performing matters
   */
  async getTopMatters(limit: number = 10): Promise<any[]> {
    return authGet<any[]>("/analytics/matters/top", { params: { limit } });
  },
};
