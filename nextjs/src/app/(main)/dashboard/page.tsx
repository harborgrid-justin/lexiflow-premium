/**
 * Dashboard Page - Server Component
 * Executive overview of firm performance and key metrics
 *
 * ENTERPRISE GUIDELINES COMPLIANCE:
 * - [✓] Guideline 1: Default export for /dashboard route
 * - [✓] Guideline 2: Server Component by default
 * - [✓] Guideline 5: Isolated data fetching via getDashboardData
 * - [✓] Guideline 7: SEO metadata export
 * - [✓] Guideline 11: Suspense for loading states
 * - [✓] Guideline 17: Self-documenting with JSDoc
 */

import { Skeleton } from "@/components/ui";
import { DashboardMetrics } from "@/features/dashboard/components/DashboardMetrics";
import { getDashboardData } from "@/lib/dal/dashboard";
import { Suspense } from "react";

export const metadata = {
  title: "Dashboard - LexiFlow",
  description: "Executive overview of firm performance",
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          {/* Calendar Date Picker Placeholder */}
          <div className="text-sm text-slate-500">Jan 20, 2026 - Feb 20, 2026</div>
        </div>
      </div>

      <div className="space-y-4">
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardMetrics stats={data.quickStats} />
        </Suspense>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Main Chart Area */}
          <div className="col-span-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white">
              Revenue Overview
            </h3>
            <div className="mt-4 h-[300px] flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
              Revenue Chart Placeholder (Recharts)
            </div>
          </div>

          {/* Recent Activity / Feed */}
          <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white">
              Recent Activity
            </h3>
            <div className="mt-4 flow-root">
              <ul className="-mb-8">
                {data.recentActivity.map((activity, itemIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {itemIdx !== data.recentActivity.length - 1 ? (
                        <span
                          className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-800"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 ring-8 ring-white dark:ring-slate-900">
                          {/* Icon based on type */}
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              {activity.description}
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-slate-500 dark:text-slate-400">
                            <time dateTime={activity.timestamp}>{new Date(activity.timestamp).toLocaleTimeString()}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  );
}
