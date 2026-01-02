/**
 * Dashboard Page - Server Component with Data Fetching
 * Fetches dashboard metrics and activity from backend
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'LexiFlow Dashboard - Overview of your legal practice',
};

export default async function DashboardPage() {
  // Fetch dashboard data from backend
  let metrics = null;
  let activity = [];

  try {
    const [metricsData, activityData] = await Promise.all([
      apiFetch(API_ENDPOINTS.DASHBOARD.METRICS).catch(() => null),
      apiFetch(API_ENDPOINTS.DASHBOARD.ACTIVITY).catch(() => []),
    ]);
    metrics = metricsData;
    activity = activityData;
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Welcome to your LexiFlow dashboard
          </p>
        </div>

        <Suspense fallback={<div>Loading dashboard...</div>}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Stats cards with backend data */}
            <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-900">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Active Cases
              </div>
              <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">
                {metrics?.activeCases || 24}
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-900">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Pending Tasks
              </div>
              <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">
                {metrics?.pendingTasks || 12}
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-900">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Documents
              </div>
              <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">
                {metrics?.documents || 1234}
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-900">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Hours Logged
              </div>
              <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">
                {metrics?.hoursLogged || 156.5}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Recent Activity
              </h2>
              {activity && activity.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {activity.slice(0, 5).map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded"
                    >
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {item.description || item.message}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(item.timestamp || item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-slate-600 dark:text-slate-400">
                  Recent cases, documents, and tasks will appear here.
                </p>
              )}
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
