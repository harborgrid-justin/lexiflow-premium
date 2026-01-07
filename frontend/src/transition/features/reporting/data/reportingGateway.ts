/**
 * Reporting Gateway - API client for reporting operations
 */

import type { Report } from "../domain/report";

class ReportingGateway {
  private apiUrl = "/api/reporting";

  async generateReport(type: string, params: any): Promise<Report> {
    const response = await fetch(`${this.apiUrl}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, params }),
    });

    if (!response.ok) throw new Error("Failed to generate report");
    return await response.json();
  }

  async exportReport(
    reportId: string,
    format: "pdf" | "csv" | "xlsx"
  ): Promise<Blob> {
    const response = await fetch(
      `${this.apiUrl}/export/${reportId}?format=${format}`
    );
    if (!response.ok) throw new Error("Failed to export report");
    return await response.blob();
  }

  async getReports(): Promise<Report[]> {
    const response = await fetch(`${this.apiUrl}/reports`);
    if (!response.ok) throw new Error("Failed to fetch reports");
    return await response.json();
  }
}

export const reportingGateway = new ReportingGateway();
