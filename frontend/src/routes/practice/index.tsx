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

import { hrApi, workflowApi } from '@/lib/frontend-api';
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
// Client Loader
// ============================================================================

/**
 * Fetches practice management data on the client side only
 * Note: Using clientLoader because auth tokens are in localStorage (not available during SSR)
 */
export async function clientLoader() {
  try {
    const [staffResult, tasksResult] = await Promise.all([
      hrApi.getAllEmployees({ page: 1, limit: 1000 }),
      workflowApi.getAllTasks({ page: 1, limit: 1000 }),
    ]);

    const staff = staffResult.ok ? staffResult.data.data : [];
    const tasksData = tasksResult.ok ? tasksResult.data.data : [];

    // Calculate active matters from tasks (placeholder logic)
    const activeMatters = tasksData.filter((t: { status?: string }) => t.status === 'in-progress').length;

    // Calculate utilization (placeholder - would need real time tracking data)
    const avgUtilization = staff.length > 0 ? 75 : 0; // Mock 75% utilization

    const pendingTasks = tasksData.filter((t: { status?: string }) => t.status !== 'completed').length;

    return {
      staffCount: staff.length,
      activeMatters,
      utilizationRate: Math.round(avgUtilization),
      pendingTasks,
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

// Ensure client loader runs on hydration
clientLoader.hydrate = true as const;

// ============================================================================
// Component
// ============================================================================

import { FirmOperations } from '@/routes/practice/components/FirmOperations';

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
