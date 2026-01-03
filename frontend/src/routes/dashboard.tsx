/**
 * Dashboard Route
 *
 * Alias route for /dashboard that provides the same functionality as home.
 * Redirects to the same dashboard component for consistency.
 *
 * @module routes/dashboard
 */

import Dashboard from '@/features/dashboard/components/Dashboard';
import { useAppController } from '@/hooks/core';
import { Suspense } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from "./+types/dashboard";
import { createMeta } from './_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ }: Route.MetaArgs) {
  return createMeta({
    title: 'Dashboard',
    description: 'Your LexiFlow command center - view cases, tasks, and key metrics',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  return {
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// Component
// ============================================================================

export default function DashboardRoute() {
  const { currentUser } = useAppController();
  const navigate = useNavigate();

  const handleSelectCase = (caseId: string) => {
    navigate(`/cases/${caseId}`);
  };

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
    <Suspense fallback={
      <div
        className="flex min-h-[400px] items-center justify-center"
        role="status"
        aria-label="Loading dashboard"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    }>
      <Dashboard
        currentUser={currentUser}
        onSelectCase={handleSelectCase}
      />
    </Suspense>
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
