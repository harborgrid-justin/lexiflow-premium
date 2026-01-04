/**
 * Evidence Vault Index Route
 *
 * Secure evidence management system for storing, organizing,
 * and tracking chain of custody for legal evidence.
 *
 * @module routes/evidence/index
 */

import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Evidence',
    count: data?.items?.length,
    description: 'Secure evidence management and chain of custody tracking',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  // TODO: Implement evidence fetching
  // const url = new URL(request.url);
  // const caseId = url.searchParams.get("caseId");
  // const evidence = await api.evidence.list({ caseId });

  return { items: [], totalCount: 0 };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create":
      // TODO: Handle evidence upload
      return { success: true, message: "Evidence uploaded" };
    case "delete":
      // TODO: Handle evidence deletion
      return { success: true, message: "Evidence deleted" };
    case "transfer":
      // TODO: Handle custody transfer
      return { success: true, message: "Custody transferred" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

import { EvidenceVault } from '@/features/litigation/evidence/EvidenceVault';

export default function EvidenceIndexRoute() {
  return <EvidenceVault />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Evidence Vault"
      message="We couldn't load the evidence data. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
