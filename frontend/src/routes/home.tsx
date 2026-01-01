/**
 * Home/Dashboard Route
 *
 * The main landing page after authentication.
 * Displays key metrics, recent activity, and quick actions.
 *
 * React Router v7 Best Practices:
 * - Exports loader for data fetching
 * - Exports meta for SEO
 * - Uses Link for navigation (not window.location)
 * - Type-safe component props from loader
 *
 * @module routes/home
 */

import Dashboard from '@/features/dashboard/components/Dashboard';
import { useAppController } from '@/hooks/core';
import { useNavigate } from 'react-router';
import type { Route } from "./+types/home";
import { createMeta } from './_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

/**
 * Meta tags for the dashboard page
 */
export function meta({}: Route.MetaArgs) {
  return createMeta({
    title: 'Dashboard',
    description: 'Your LexiFlow command center - view cases, tasks, and key metrics',
  });
}

// ============================================================================
// Loader
// ============================================================================

/**
 * Dashboard loader - fetches summary data
 * In production, this would fetch from the API
 */
export async function loader({ request }: Route.LoaderArgs) {
  // TODO: Fetch dashboard data
  // const [metrics, recentCases, tasks] = await Promise.all([
  //   api.dashboard.getMetrics(),
  //   api.cases.getRecent(5),
  //   api.tasks.getPending(),
  // ]);

  return {
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// Component
// ============================================================================

export default function Home({ loaderData }: Route.ComponentProps) {
  const { currentUser } = useAppController();
  const navigate = useNavigate();

  // Handle case selection - navigate to case detail
  const handleSelectCase = (caseId: string) => {
    navigate(`/cases/${caseId}`);
  };

  // While user is loading
  if (!currentUser) {
    return (
      <div
        className="flex min-h-[400px] items-center justify-center"
        role="status"
        aria-label="Loading dashboard"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <Dashboard
      currentUser={currentUser}
      onSelectCase={handleSelectCase}
    />
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
        <h2 className="mb-2 text-xl font-semibold text-red-900 dark:text-red-100">
          Dashboard Error
        </h2>
        <p className="mb-4 text-red-700 dark:text-red-300">
          {error instanceof Error ? error.message : 'Failed to load dashboard'}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Reload Dashboard
        </button>
      </div>
    </div>
  );
}
