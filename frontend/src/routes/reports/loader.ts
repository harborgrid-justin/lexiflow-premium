/**
 * Reports & Analytics Domain - Data Loader
 */

import { DataService } from "../../services/data/dataService";

type Report = {
  id: string;
  name: string;
  type: string;
  description: string;
  lastRun?: string;
  schedule?: string;
  status: string;
};

export interface ReportsLoaderData {
  reports: Report[];
  recentReports: Report[];
}

export async function reportsLoader(): Promise<ReportsLoaderData> {
  const reports = await DataService.reports.getAll().catch(() => []);

  return {
    reports: reports || [],
    recentReports: (reports || []).slice(0, 5),
  };
}
