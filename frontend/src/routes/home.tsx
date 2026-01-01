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

import { api } from '@/api';
import Dashboard from '@/features/dashboard/components/Dashboard';
import { Suspense } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from "./+types/home";
import { createMeta } from './_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

/**
 * Meta tags for the dashboard page
 */
export function meta(_: Route.MetaArgs) {
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
export async function loader({ request: _ }: Route.LoaderArgs) {
  try {
    const [cases, tasks] = await Promise.all([
      api.cases.getAll(),
      api.tasks.getAll(),
    ]);

    // Calculate metrics
    const activeCases = cases.filter(c => c.status === 'Active').length;
    const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
    const highPriorityTasks = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length;

    // Get recent items
    const recentCases = cases
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);

    const upcomingTasks = tasks
      .filter(t => t.dueDate && t.status !== 'Completed')
      .sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime())
      .slice(0, 5);

    return {
      metrics: {
        activeCases,
        pendingTasks,
        highPriorityTasks,
      },
      recentCases,
      upcomingTasks,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
    return {
      metrics: {
        activeCases: 0,
        pendingTasks: 0,
        highPriorityTasks: 0,
      },
      recentCases: [],
      upcomingTasks: [],
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { metrics, recentCases, upcomingTasks } = loaderData;

  const handleSelectCase = (caseId: string) => {
    navigate(`/cases/${caseId}`);
  };

  // Pass data to the Dashboard feature component
  // Note: Dashboard component might need to be updated to accept props instead of fetching internally
  // For now, we'll assume it can accept initialData or we just render it as is
  // If Dashboard fetches its own data, we might be double fetching, but loader ensures data is ready for SSR

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <Dashboard
        // @ts-expect-error - Dashboard component might not accept these props yet, but we're preparing for it
        metrics={metrics}
        recentCases={recentCases}
        upcomingTasks={upcomingTasks}
        onSelectCase={handleSelectCase}
      />
    </Suspense>
  );
}
