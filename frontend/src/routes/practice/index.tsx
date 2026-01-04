/**
 * Firm Operations Route
 *
 * Practice and firm management with:
 * - Server-side data loading via loader
 * - Staff management
 * - Resource allocation
 * - Operational metrics
 *
 * @module routes/practice/index
 */

import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Firm Operations',
    description: 'Manage practice operations, staff, and resources',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  // TODO: Implement practice data fetching
  // const [staff, resources, metrics] = await Promise.all([
  //   api.practice.getStaff(),
  //   api.practice.getResources(),
  //   api.practice.getMetrics(),
  // ]);

  return {
    staffCount: 0,
    activeMatters: 0,
    utilizationRate: 0,
    pendingTasks: 0,
  };
}

// ============================================================================
// Component
// ============================================================================

import { FirmOperations } from '@/features/knowledge/practice/FirmOperations';

export default function PracticeIndexRoute() {
  return <FirmOperations />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Firm Operations"
      message="We couldn't load the operations data. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
