/**
 * Reports & Analytics Domain - Data Loader
 */

import { DataService } from "@/services/data/data-service.service";
import { defer } from "react-router";

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

export async function reportsLoader() {
  const reports = await DataService.reports.getAll().catch(() => []);

  return defer({
    reports: reports || [],
    recentReports: (reports || []).slice(0, 5),
  });
}
