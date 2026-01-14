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

import { useAppController } from '@/hooks/core';
import { casesApi, workflowApi } from '@/lib/frontend-api';
import Dashboard from '@/routes/dashboard/components/Dashboard';
import { Suspense } from 'react';
import { useLoaderData, useNavigate } from 'react-router';
import type { Route } from "./+types/home";
import { createMeta } from './_shared/meta-utils';

interface DashboardCase {
  id?: string;
  status?: string;
  updatedAt?: string;
  createdAt?: string;
  [key: string]: unknown;
}

interface DashboardTask {
  id?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  [key: string]: unknown;
}

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
 *
 * Enterprise API Pattern:
 * - Uses new @/lib/frontend-api layer
 * - Handles Result<T> error returns
 * - Extracts data from paginated results
 * - Falls back gracefully on errors
 */
export async function clientLoader({ request: _ }: Route.ClientLoaderArgs) {
  try {
    // Fetch cases and tasks using new enterprise API
    const casesArray = await casesApi.getAll({ page: 1, limit: 100 });
    const tasksResult = await workflowApi.getAllTasks({ page: 1, limit: 100 });

    // Handle Result<T> returns for tasks - check for ok flag
    let tasksArray: DashboardTask[] = [];

    if (tasksResult.ok) {
      tasksArray = (tasksResult.data as { data: DashboardTask[] })?.data || [];
    }

    // Calculate metrics
    const activeCases = casesArray.filter(c => c.status === 'Active').length;
    const pendingTasks = tasksArray.filter(t => t.status !== 'Completed').length;
    const highPriorityTasks = tasksArray.filter(t => t.priority === 'High' && t.status !== 'Completed').length;

    // Get recent items
    const recentCases = casesArray
      .sort((a, b) => {
        const dateA = new Date((a.updatedAt || a.createdAt || 0) as string | number).getTime();
        const dateB = new Date((b.updatedAt || b.createdAt || 0) as string | number).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);

    console.log('recent cases data:', recentCases);

    const upcomingTasks = tasksArray
      .filter(t => t.dueDate && t.status !== 'Completed')
      .sort((a, b) => new Date((a.dueDate || 0) as string | number).getTime() - new Date((b.dueDate || 0) as string | number).getTime())
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
  const loaderData = useLoaderData() as Route.ComponentProps['loaderData'];
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
