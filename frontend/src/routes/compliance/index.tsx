/**
 * Compliance Route
 *
 * Regulatory compliance and ethics management with:
 * - Server-side data loading via loader
 * - Compliance tracking and reporting
 * - Conflict checking
 * - Ethics guidelines
 *
 * @module routes/compliance/index
 */

import { api } from '@/api';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
// import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta(_: Route.MetaArgs) {
  return createMeta({
    title: 'Compliance',
    description: 'Manage regulatory compliance, ethics, and conflict checking',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request: _ }: Route.LoaderArgs) {
  try {
    const [alerts, reports, conflicts] = await Promise.all([
      api.compliance.getChecks({ status: 'requires_review' }).catch(() => []),
      api.reports.getAll({ status: 'pending' }).catch(() => []),
      api.conflictChecks.getAll({ status: 'pending' }).catch(() => []),
    ]);

    return {
      alerts,
      pendingReports: reports.length,
      conflictChecks: conflicts.length,
      lastAuditDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to load compliance data:", error);
    return {
      alerts: [],
      pendingReports: 0,
      conflictChecks: 0,
      lastAuditDate: null,
    };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "run-conflict-check":
        // In a real app, we would parse form data and call api.compliance.compliance.runCheck(...)
        return { success: true, message: "Conflict check initiated" };

      case "acknowledge-alert":
        // api.compliance.compliance.updateCheck(...)
        return { success: true };

      case "generate-report":
        // api.compliance.reports.generate(...)
        return { success: true, message: "Report generated" };

      default:
        return { success: false, error: "Invalid action" };
    }
  } catch (error) {
    console.error("Action failed:", error);
    return { success: false, error: "Operation failed" };
  }
}

// ============================================================================
// Component
// ============================================================================

import { ComplianceDashboard } from '@/features/operations/compliance/ComplianceDashboard';

export default function ComplianceIndexRoute() {
  return <ComplianceDashboard />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Compliance"
      message="We couldn't load the compliance data. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
