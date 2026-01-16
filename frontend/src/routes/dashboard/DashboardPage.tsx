/**
 * ================================================================================
 * DASHBOARD PAGE - ORCHESTRATION LAYER
 * ================================================================================
 *
 * RESPONSIBILITIES:
 * - Load data from router loader
 * - Set up Suspense boundaries (rendering concern)
 * - Set up Await boundaries (data concern)
 * - Initialize domain provider
 * - Render pure view component
 * - Handle navigation with transitions
 *
 * ENTERPRISE PATTERN:
 * Suspense (rendering boundary)
 *   → Await (data boundary - only for deferred data)
 *     → Provider (domain layer)
 *       → View (pure presentation)
 *
 * DATA FLOW:
 * useLoaderData() → Suspense → Await → Provider → View
 *
 * CRITICAL RULES:
 * - NO business logic in this file
 * - NO direct data manipulation
 * - ONLY orchestration and boundaries
 * - View is pure and receives context
 *
 * @module routes/dashboard/DashboardPage
 */

import { PageFrame } from "@/layouts/PageFrame";
import type { DocketEntry, TimeEntry } from "@/types";
import { Suspense } from "react";
import { Await, useLoaderData, useRevalidator } from "react-router";
import { DashboardProvider } from "./DashboardProvider";
import { DashboardView } from "./DashboardView";
import type { clientLoader } from "./loader";

/**
 * Dashboard Page - Orchestration Component
 *
 * PATTERN:
 * 1. useLoaderData() - Get deferred data from loader
 * 2. Critical data (cases, tasks) available immediately
 * 3. Suspense - Rendering boundary for deferred data
 * 4. Await - Data boundary for streaming data
 * 5. Provider - Domain context (transforms data)
 * 6. View - Pure presentation (no side effects)
 */
export function DashboardPageContent() {
  const data = useLoaderData<typeof clientLoader>();
  const revalidator = useRevalidator();

  // Guard against undefined data
  if (!data) {
    return <DeferredDataSkeleton title="Loading dashboard..." />;
  }

  return (
    <PageFrame
      title="Command Center"
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      {/* Main content with critical data (already loaded) */}
      <DashboardProvider
        initialCases={data.cases}
        initialTasks={data.tasks}
        onRevalidate={revalidator.revalidate}
      >
        <DashboardView />

        {/* Deferred data sections with nested Suspense */}
        <div className="mt-6 space-y-6">
          <Suspense fallback={<DeferredDataSkeleton title="Recent Docket" />}>
            <Await resolve={data.recentDocketEntries} errorElement={<DeferredDataError />}>
              {(docketEntries) => (
                <DashboardRecentDocket entries={docketEntries} />
              )}
            </Await>
          </Suspense>

          <Suspense fallback={<DeferredDataSkeleton title="Recent Time" />}>
            <Await resolve={data.recentTimeEntries} errorElement={<DeferredDataError />}>
              {(timeEntries) => (
                <DashboardRecentTime entries={timeEntries} />
              )}
            </Await>
          </Suspense>
        </div>
      </DashboardProvider>
    </PageFrame>
  );
}

/**
 * Deferred Data Skeleton
 * Shows while deferred data is streaming
 */
function DeferredDataSkeleton({ title }: { title: string }) {
  return (
    <div
      style={{ backgroundColor: "var(--color-surface)" }}
      className="p-4 rounded-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-700">{title}</h3>
        <div
          style={{ backgroundColor: "var(--color-surfaceHover)" }}
          className="h-6 w-20 rounded animate-pulse"
        />
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{ backgroundColor: "var(--color-surfaceHover)" }}
            className="h-16 rounded animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Deferred Data Error
 * Shows when deferred data fails to load
 */
function DeferredDataError() {
  return (
    <div
      style={{ backgroundColor: "var(--color-surface)" }}
      className="p-4 rounded-lg border-2 border-rose-200"
    >
      <p className="text-rose-600 text-sm">Failed to load data</p>
    </div>
  );
}

/**
 * Dashboard Recent Docket
 * Displays recent docket entries (deferred data)
 */
function DashboardRecentDocket({ entries }: { entries: DocketEntry[] }) {
  return (
    <div
      style={{ backgroundColor: "var(--color-surface)" }}
      className="p-4 rounded-lg"
    >
      <h3 className="font-semibold mb-4 text-slate-700">Recent Docket Entries</h3>
      {entries.length > 0 ? (
        <div className="space-y-2">
          {entries.slice(0, 5).map((entry) => (
            <div
              key={entry.id}
              className="p-3 rounded border border-slate-200 hover:bg-slate-50 transition"
            >
              <p className="text-sm font-medium">{entry.entryNumber || 'N/A'}</p>
              <p className="text-xs text-slate-600">
                {entry.filingDate ? new Date(entry.filingDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No recent entries</p>
      )}
    </div>
  );
}

/**
 * Dashboard Recent Time
 * Displays recent time entries (deferred data)
 */
function DashboardRecentTime({ entries }: { entries: TimeEntry[] }) {
  return (
    <div
      style={{ backgroundColor: "var(--color-surface)" }}
      className="p-4 rounded-lg"
    >
      <h3 className="font-semibold mb-4 text-slate-700">Recent Time Entries</h3>
      {entries.length > 0 ? (
        <div className="space-y-2">
          {entries.slice(0, 5).map((entry) => (
            <div
              key={entry.id}
              className="p-3 rounded border border-slate-200 hover:bg-slate-50 transition"
            >
              <p className="text-sm font-medium">{entry.description || 'Time entry'}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-slate-600">
                  {entry.date ? new Date(entry.date).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-xs font-semibold text-blue-600">
                  {entry.hours || 0}h
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No recent time entries</p>
      )}
    </div>
  );
}
