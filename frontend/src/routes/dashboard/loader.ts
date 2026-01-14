import { DataService } from "@/services/data/data-service.service";
import type { Case, DocketEntry, Task, TimeEntry } from "@/types";
import type { LoaderFunctionArgs } from "react-router";

export interface DashboardLoaderData {
  cases: Case[];
  recentDocketEntries: DocketEntry[];
  recentTimeEntries: TimeEntry[];
  tasks: Task[];
}

/**
 * Loader for Dashboard
 * Fetches overview data across multiple domains
 *
 * ENTERPRISE PATTERN: Direct promise return for streaming data
 * - Returns promises immediately (non-blocking)
 * - Suspense handles loading states
 * - Parallel data fetching optimizes performance
 */
export async function clientLoader(_args: LoaderFunctionArgs) {
  // Start parallel data fetching (do NOT await here)
  const casesPromise = DataService.cases.getAll();
  const docketEntriesPromise = DataService.docket.getAll();
  const timeEntriesPromise = DataService.timeEntries.getAll();
  const tasksPromise = DataService.workflow.getTasks();

  // Await ALL data before returning (required for initial critical data)
  // For progressive rendering, use: return { cases: casesPromise, ... })
  const [cases, docketEntries, timeEntries, tasks] = await Promise.all([
    casesPromise,
    docketEntriesPromise,
    timeEntriesPromise,
    tasksPromise,
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

  // Return promises directly for Suspense/Await pattern
  return {
    cases,
    recentDocketEntries,
    recentTimeEntries,
    tasks,
  });
}
