/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Dashboard Page Component
 *
 * Handles Suspense/Await wiring for dashboard route with deferred data
 * Supports nested Suspense boundaries for incremental loading
 *
 * @module routes/dashboard/DashboardPage
 */

import { PageFrame } from "@/layouts/PageFrame";
import { Suspense } from 'react';
import { Await, useRevalidator } from 'react-router';
import { RouteSkeleton } from '../_shared/RouteSkeletons';
import { DashboardProvider } from './DashboardProvider';
import DashboardView from './DashboardView';
import {
  DashboardRecentDocket,
  DashboardRecentTime,
  DeferredDataError,
  DeferredDataSkeleton
} from './components/RecentActivityWidgets';
import type { loader } from './loader';

interface DashboardPageProps {
  loaderData: Awaited<ReturnType<typeof loader>>;
}

export function DashboardPage({ loaderData }: DashboardPageProps) {
  const revalidator = useRevalidator();

  if (!loaderData) {
    return <RouteSkeleton title="Loading Dashboard..." />;
  }

  return (
    <PageFrame
      title="Command Center"
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      <DashboardProvider
        initialCases={loaderData.cases}
        initialTasks={loaderData.tasks}
        onRevalidate={revalidator.revalidate}
      >
        <div className="space-y-6">
          <DashboardView />

          {/* Deferred data sections with nested Suspense */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
            <Suspense fallback={<DeferredDataSkeleton title="Recent Docket" />}>
              <Await resolve={loaderData.recentDocketEntries} errorElement={<DeferredDataError />}>
                {(docketEntries) => (
                  <DashboardRecentDocket entries={docketEntries as any} />
                )}
              </Await>
            </Suspense>

            <Suspense fallback={<DeferredDataSkeleton title="Recent Time" />}>
              <Await resolve={loaderData.recentTimeEntries} errorElement={<DeferredDataError />}>
                {(timeEntries) => (
                  <DashboardRecentTime entries={timeEntries as any} />
                )}
              </Await>
            </Suspense>
          </div>
        </div>
      </DashboardProvider>
    </PageFrame>
  );
}
