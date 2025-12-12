/**
 * Report Service
 * Handles all report generation and management API calls
 */

const API_BASE_URL = '/api/v1';

export interface GenerateReportRequest {
  type: string;
  title: string;
  description?: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  startDate?: Date;
  endDate?: Date;
  filters?: Record<string, any>;
  parameters?: Record<string, any>;
  emailRecipients?: string[];
}

export const reportService = {
  /**
   * Get available report templates
   */
  async getReportTemplates() {
    const response = await fetch(`${API_BASE_URL}/reports/templates`);
    if (!response.ok) throw new Error('Failed to fetch report templates');
    return response.json();
  },

  /**
   * Get list of generated reports
   */
  async getReports(page: number = 1, limit: number = 20) {
    const response = await fetch(`${API_BASE_URL}/reports?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch reports');
    return response.json();
  },

  /**
   * Get a specific report by ID
   */
  async getReportById(reportId: string) {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}`);
    if (!response.ok) throw new Error('Failed to fetch report');
    return response.json();
  },

  /**
   * Generate a new report
   */
  async generateReport(request: GenerateReportRequest) {
    const response = await fetch(`${API_BASE_URL}/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to generate report');
    return response.json();
  },

  /**
   * Get download URL for a report
   */
  async getDownloadUrl(reportId: string) {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/download`);
    if (!response.ok) throw new Error('Failed to get download URL');
    return response.json();
  },

  /**
   * Delete a report
   */
  async deleteReport(reportId: string) {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete report');
    return response.json();
  },

  /**
   * Schedule a recurring report
   */
  async scheduleReport(request: GenerateReportRequest & {
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly';
      dayOfWeek?: number;
      dayOfMonth?: number;
      time: string;
    };
  }) {
    const response = await fetch(`${API_BASE_URL}/reports/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to schedule report');
    return response.json();
  },

  /**
   * Get scheduled reports
   */
  async getScheduledReports() {
    const response = await fetch(`${API_BASE_URL}/reports/scheduled`);
    if (!response.ok) throw new Error('Failed to fetch scheduled reports');
    return response.json();
  },

  /**
   * Cancel a scheduled report
   */
  async cancelScheduledReport(scheduleId: string) {
    const response = await fetch(`${API_BASE_URL}/reports/scheduled/${scheduleId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to cancel scheduled report');
    return response.json();
  },

  /**
   * Generate executive dashboard report
   */
  async generateExecutiveDashboard(firmId: string, period: 'month' | 'quarter' | 'year' = 'month') {
    const response = await fetch(
      `${API_BASE_URL}/analytics/reports/executive-dashboard/${firmId}?period=${period}`,
    );
    if (!response.ok) throw new Error('Failed to generate executive dashboard');
    return response.json();
  },

  /**
   * Generate attorney performance report
   */
  async generateAttorneyPerformance(attorneyId: string, period: 'month' | 'quarter' | 'year' = 'year') {
    const response = await fetch(
      `${API_BASE_URL}/analytics/reports/attorney-performance/${attorneyId}?period=${period}`,
    );
    if (!response.ok) throw new Error('Failed to generate attorney performance report');
    return response.json();
  },

  /**
   * Generate matter profitability report
   */
  async generateMatterProfitability(caseId: string) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/reports/matter-profitability/${caseId}`,
    );
    if (!response.ok) throw new Error('Failed to generate matter profitability report');
    return response.json();
  },

  /**
   * Generate practice area report
   */
  async generatePracticeAreaReport(practiceArea: string) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/reports/practice-area/${practiceArea}`,
    );
    if (!response.ok) throw new Error('Failed to generate practice area report');
    return response.json();
  },

  /**
   * Generate client analytics report
   */
  async generateClientAnalytics(clientId: string) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/reports/client-analytics/${clientId}`,
    );
    if (!response.ok) throw new Error('Failed to generate client analytics report');
    return response.json();
  },

  /**
   * Export analytics report to file
   */
  async exportAnalyticsReport(
    reportType: string,
    reportId: string,
    format: 'pdf' | 'excel' | 'csv',
  ) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/reports/export/${reportType}/${reportId}?format=${format}`,
    );
    if (!response.ok) throw new Error('Failed to export analytics report');
    const blob = await response.blob();
    return blob;
  },
};

export default reportService;
