/**
 * Report domain model
 */

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  status: ReportStatus;
  generatedAt: string;
  parameters: Record<string, any>;
  data: any;
}

export type ReportType = "financial" | "analytics" | "usage" | "custom";

export type ReportStatus = "pending" | "generating" | "completed" | "failed";
