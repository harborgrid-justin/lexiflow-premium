/**
 * Real Estate: Encroachment Route
 *
 * Manages encroachment cases involving unauthorized use or occupation of
 * government-owned real property, including investigation and resolution tracking.
 *
 * @module routes/real-estate/encroachment
 */

import { DataService } from '@/services/data/dataService';
import { Link, useNavigate } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/encroachment";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Real Estate - Encroachment',
    description: 'Manage encroachment cases involving unauthorized property use including investigation and resolution tracking.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  try {
    const encroachments = (await DataService.realEstate.getEncroachments()) as any[];
    const activeEncroachments = encroachments.filter((e: any) => e.status === 'Active' || e.status === 'Under Review');

    return {
      data: encroachments,
      stats: {
        total: encroachments.length,
        active: activeEncroachments.length,
        resolved: encroachments.filter((e: any) => e.status === 'Resolved').length,
      }
    };
  } catch (error) {
    console.error('Failed to fetch encroachment data:', error);
    return {
      data: [],
      stats: { total: 0, active: 0, resolved: 0 }
    };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create":
      return { success: true };
    case "update":
      return { success: true };
    case "delete":
      return { success: true };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function EncroachmentRoute() {
  const navigate = useNavigate();
  console.log('useNavigate:', navigate);

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/real_estate/portfolio_summary" className="hover:text-gray-700 dark:hover:text-gray-200">
          Real Estate
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-gray-100">Encroachment</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Encroachment
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Track and resolve encroachment cases on government-owned properties.
        </p>
      </div>

      {/* Content Placeholder */}
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Encroachment Module
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This real estate module is under development.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Encroachment"
      message="We couldn't load the encroachment data. Please try again."
      backTo="/real_estate/portfolio_summary"
      backLabel="Return to Portfolio Summary"
    />
  );
}
