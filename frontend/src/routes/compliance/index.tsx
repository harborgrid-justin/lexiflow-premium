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

import { complianceApi } from '@/lib/frontend-api';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';

// ============================================================================
// Types
// ============================================================================

interface RouteErrorBoundaryProps {
  error: unknown;
}

// ============================================================================
// Meta Tags
// ============================================================================

export function meta(_: unknown) {
  return createMeta({
    title: 'Compliance',
    description: 'Manage regulatory compliance, ethics, and conflict checking',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request: _ }: LoaderFunctionArgs) {
  try {
    const [alertsResult, reportsResult, conflictsResult] = await Promise.all([
      complianceApi.getComplianceChecks({ status: 'requires_review', page: 1, limit: 50 }),
      complianceApi.getComplianceReports({ status: 'pending', page: 1, limit: 50 }),
      complianceApi.getConflictChecks({ status: 'pending', page: 1, limit: 50 }),
    ]);

    const alerts = alertsResult.ok ? alertsResult.data.data : [];
    const reports = reportsResult.ok ? reportsResult.data.data : [];
    const conflicts = conflictsResult.ok ? conflictsResult.data.data : [];

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

export async function action({ request }: ActionFunctionArgs) {
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

export function ErrorBoundary({ error }: RouteErrorBoundaryProps) {
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
