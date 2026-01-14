import type { LoaderFunctionArgs } from "react-router";
import { DataService } from "../../services/dataService";
import type { Case, DocketEntry, Task, TimeEntry } from "../../types";

export interface DashboardLoaderData {
  cases: Case[];
  recentDocketEntries: DocketEntry[];
  recentTimeEntries: TimeEntry[];
  tasks: Task[];
}

/**
 * Loader for Dashboard
 * Fetches overview data across multiple domains
 */
export async function clientLoader({
  request,
}: LoaderFunctionArgs): Promise<DashboardLoaderData> {
  // Parallel data fetching
  const [cases, docketEntries, timeEntries, tasks] = await Promise.all([
    DataService.cases.getAll(),
    DataService.docket.getAll(),
    DataService.timeEntries.getAll(),
    DataService.workflow.getTasks(),
  ]);

  // Filter for recent data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentDocketEntries = docketEntries
    .filter((entry) => new Date(entry.filingDate) >= thirtyDaysAgo)
    .slice(0, 10);

  const recentTimeEntries = timeEntries
    .filter((entry) => new Date(entry.date) >= thirtyDaysAgo)
    .slice(0, 10);

  return {
    cases,
    recentDocketEntries,
    recentTimeEntries,
    tasks,
  };
}
