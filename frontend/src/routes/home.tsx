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
import { useAppController } from '@/hooks/core';
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
// Client Loader (runs only on client where localStorage is available)
// ============================================================================

/**
 * Dashboard client loader - fetches summary data on client side only
 * This runs only in the browser where localStorage auth tokens are available
 *
 * Note: Using clientLoader instead of loader because authentication tokens
 * are stored in localStorage which is not available during SSR
 */
export async function clientLoader({ request: _ }: Route.ClientLoaderArgs) {
  try {
    const [cases, tasks] = await Promise.all([
      api.cases.getAll(),
      api.tasks.getAll(),
    ]);

    // Ensure we have arrays (defensive programming)
    const casesArray = Array.isArray(cases) ? cases : [];
    const tasksArray = Array.isArray(tasks) ? tasks : [];

    // Calculate metrics
    const activeCases = casesArray.filter(c => c.status === 'Active').length;
    const pendingTasks = tasksArray.filter(t => t.status !== 'Completed').length;
    const highPriorityTasks = tasksArray.filter(t => t.priority === 'High' && t.status !== 'Completed').length;

    // Get recent items
    const recentCases = casesArray
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
console.log('recent cases data:', recentCases);
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);

    const upcomingTasks = tasksArray
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

export default function HomeRoute() {
  const navigate = useNavigate();
  const { currentUser } = useAppController();
  const { metrics: _metrics, recentCases: _recentCases, upcomingTasks: _upcomingTasks } = loaderData;

  const handleSelectCase = (caseId: string) => {
    navigate(`/cases/${caseId}`);
  };

  // Show loading state if currentUser is not available yet
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <Dashboard
        currentUser={currentUser}
        onSelectCase={handleSelectCase}
      />
    </Suspense>
  );
}