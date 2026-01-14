import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { DashboardProvider } from './DashboardProvider';
import { DashboardView } from './DashboardView';
import type { clientLoader } from './loader';

/**
 * Dashboard Page - Data Orchestration Layer
 *
 * ENTERPRISE ARCHITECTURE PATTERN:
 * - Suspense wraps the entire page (rendering boundary)
 * - Await resolves deferred loader data (data boundary)
 * - Provider initializes with resolved data (domain layer)
 * - View renders pure presentation (UI layer)
 *
 * DATA FLOW:
 * Router loader → defer() → Suspense → Await → Provider → View
 */
export function DashboardPageContent() {
  const data = useLoaderData<typeof clientLoader>();

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Await resolve={data} errorElement={<DashboardError />}>
        {(resolved) => (
          <DashboardProvider
            initialCases={resolved.cases}
            initialDocketEntries={resolved.recentDocketEntries}
            initialTimeEntries={resolved.recentTimeEntries}
            initialTasks={resolved.tasks}
          >
            <DashboardView />
          </DashboardProvider>
        )}
      </Await>
    </Suspense>
  );
}

/**
 * Dashboard Skeleton - Suspense Fallback
 * Shows while loader data is resolving
 */
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-pulse">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
}

/**
 * Dashboard Error - Error Boundary
 * Shows when loader fails
 */
function DashboardError() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-rose-600">Failed to load dashboard</h2>
        <p className="text-slate-600 dark:text-slate-400">Please refresh the page or contact support</p>
      </div>
    </div>
  );
}
