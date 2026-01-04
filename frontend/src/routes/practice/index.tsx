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

import { DataService } from '@/services/data/dataService';
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
  try {
    const [staff, metrics] = await Promise.all([
      DataService.hr.getAll(),
      DataService.hr.getUtilizationMetrics()
    ]);

    const activeMatters = metrics.reduce((acc, m) => acc + m.cases, 0);
    const avgUtilization = metrics.length > 0
      ? metrics.reduce((acc, m) => acc + m.utilization, 0) / metrics.length
      : 0;

    return {
      staffCount: staff.length,
      activeMatters,
      utilizationRate: Math.round(avgUtilization),
      pendingTasks: 0, // TODO: Integrate with TaskService when available
    };
  } catch (error) {
    console.error("Failed to load practice data", error);
    return {
      staffCount: 0,
      activeMatters: 0,
      utilizationRate: 0,
      pendingTasks: 0,
    };
  }
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
