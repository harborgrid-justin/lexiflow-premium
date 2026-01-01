/**
 * Rate Tables Route
 * Manage billing rates and rate tables
 */

import { RateTablesApiService } from '@/api/billing';
import RateTableManagement from '@/features/operations/billing/rate-tables/RateTableManagement';
import { Suspense } from 'react';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/rates";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Rate Tables',
    count: data?.rateTables?.length,
    description: 'Manage billing rates and rate tables',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: Route.LoaderArgs) {
  const rateTablesApi = new RateTablesApiService();

  try {
    const rateTables = await rateTablesApi.getAll();

    return {
      rateTables,
    };
  } catch (error) {
    console.error('Failed to load rate tables:', error);
    return {
      rateTables: [],
    };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function RateTablesRoute({ loaderData }: Route.ComponentProps) {
  const { rateTables } = loaderData;

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Rate Tables
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage billing rates for timekeepers and services
          </p>
        </div>

        {/* Rate Table Management */}
        <RateTableManagement />
      </div>
    </Suspense>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Rate Tables"
      message="We couldn't load the rate tables. Please try again."
      backTo="/billing"
      backLabel="Return to Billing"
    />
  );
}
