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
import { useTheme } from '@/features/theme';
import { Suspense } from 'react';
import { useNavigate } from 'react-router';
import { createMeta } from './_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
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

interface DashboardRouteProps {
  loaderData: {
    timestamp: string;
  };
}

export default function DashboardRoute({ loaderData: _loaderData }: DashboardRouteProps) {
  const { currentUser } = useAppController();
  const { theme } = useTheme();
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
        <div className="h-8 w-8 animate-spin rounded-full border-4" style={{ borderColor: theme.primary.DEFAULT + '33', borderTopColor: theme.primary.DEFAULT }} />
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

export function ErrorBoundary({ error }: { error: unknown }) {
  const { theme } = useTheme();
  
  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className={`max-w-md rounded-lg border p-6 text-center ${theme.border.default}`} style={{ backgroundColor: theme.status.error + '10' }}>
        <h2 className={`mb-2 text-xl font-semibold ${theme.text.primary}`}>
          Dashboard Error
        </h2>
        <p className={`mb-4 ${theme.text.secondary}`}>
          {error instanceof Error ? error.message : 'Failed to load dashboard'}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={`rounded-md px-4 py-2 text-white ${theme.primary.hover}`}
          style={{ backgroundColor: theme.status.error.bg }}
        >
          Reload Dashboard
        </button>
      </div>
    </div>
  );
}
