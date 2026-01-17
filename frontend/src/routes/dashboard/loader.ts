/**
 * ================================================================================
 * DASHBOARD LOADER - DATA AUTHORITY
 * ================================================================================
 *
 * RESPONSIBILITIES:
 * - Fetch all required data for dashboard
 * - Return deferred promises for progressive rendering
 * - Handle authentication errors
 * - Parallel data fetching for performance
 *
 * ENTERPRISE PATTERN:
 * - Loader owns data truth (server-aware, deterministic)
 * - Returns raw data (no transformation)
 * - Uses defer() for streaming non-critical data
 * - Handles errors at data layer
 *
 * DATA FLOW:
 * loader() → defer({ critical, deferred }) → Suspense → Await → Provider
 *
 * @module routes/dashboard/loader
 */

import { defer } from "@remix-run/router";
import { type LoaderFunctionArgs } from "react-router";

import {
  billingApi,
  casesApi,
  docketApi,
  workflowApi,
} from "@/lib/frontend-api";
import { handleLoaderAuthError } from "@/utils/loader-helpers";

import type { Case, DocketEntry, Task, TimeEntry } from "@/types";

export interface DashboardLoaderData {
  // Critical data (awaited before render)
  cases: Case[];
  tasks: Task[];

  // Deferred data (streamed after initial render)
  recentDocketEntries: Promise<DocketEntry[]>;
  recentTimeEntries: Promise<TimeEntry[]>;
}

/**
 * Dashboard Loader
 *
 * PATTERN: Critical + Deferred Data
 * - cases, tasks: Awaited before render (needed for metrics)
 * - docket, timeEntries: Streamed after initial render (progressive enhancement)
 *
 * OPTIMIZATION:
 * - Parallel fetching with Promise.all()
 * - Use defer() for non-critical data
 * - Suspense handles loading states
 */
export async function clientLoader(args: LoaderFunctionArgs) {
  try {
    // Critical data (MUST be available before render)
    const criticalData = Promise.all([
      casesApi.getAll({ page: 1, limit: 1000 }),
      workflowApi.getAllTasks({ page: 1, limit: 200 }),
    ]);

    // Deferred data (streams after initial render)
    const docketEntriesPromise = docketApi
      .getAll({ page: 1, limit: 200 })
      .then((result) => {
        const entries =
          result.ok && Array.isArray(result.data.data) ? result.data.data : [];

        // Filter for recent (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return entries
          .filter(
            (entry) =>
              entry?.filingDate && new Date(entry.filingDate) >= thirtyDaysAgo
          )
          .slice(0, 10);
      });

    const timeEntriesPromise = billingApi.getAllTimeEntries().then((result) => {
      const entries =
        result.ok && Array.isArray(result.data) ? result.data : [];

      // Filter for recent (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return entries
        .filter((entry) => entry?.date && new Date(entry.date) >= thirtyDaysAgo)
        .slice(0, 10);
    });

    // Await critical data
    const [casesResult, tasksResult] = await criticalData;

    const cases = casesResult.ok ? casesResult.data.data : [];
    const tasks = tasksResult.ok ? tasksResult.data.data : [];

    // Return deferred loader data
    // Critical data is available immediately
    // Deferred promises will be resolved via <Await>
    return defer({
      cases,
      tasks,
      recentDocketEntries: docketEntriesPromise,
      recentTimeEntries: timeEntriesPromise,
    });
  } catch (error) {
    // Handle authentication errors (SSR redirect or client re-throw)
    handleLoaderAuthError(error, args);

    // If we get here, it's a non-auth error - return empty data
    console.error(
      "[Dashboard Loader] Non-auth error, returning empty data:",
      error
    );

    return defer({
      cases: [],
      tasks: [],
      recentDocketEntries: Promise.resolve([]),
      recentTimeEntries: Promise.resolve([]),
    });
  }
}

/**
 * Server Loader (for SSR)
 * Delegates to main loader
 */
export const loader = clientLoader;
