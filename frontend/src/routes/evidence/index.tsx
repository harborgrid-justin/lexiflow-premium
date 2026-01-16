/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Evidence Vault Index Route
 *
 * Secure evidence management system for storing, organizing,
 * and tracking chain of custody for legal evidence.
 *
 * @module routes/evidence/index
 */

import { discoveryApi } from '@/lib/frontend-api';
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

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const caseId = url.searchParams.get("caseId");

    // Fetch evidence using new enterprise API with pagination
    const result = caseId
      ? await discoveryApi.getEvidenceByCase(caseId)
      : await discoveryApi.getAllEvidence({ page: 1, limit: 100 });

    if (!result.ok) {
      return { items: [], totalCount: 0 };
    }

    const items = result.data.data;
    const filteredEvidence = caseId
      ? items
      : items;

    return {
      items: filteredEvidence,
      totalCount: result.data.total
    };
  } catch (error) {
    console.error("Failed to fetch evidence:", error);
    return { items: [], totalCount: 0 };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create": {
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const caseId = formData.get("caseId") as string;
      const evidenceType = formData.get("evidenceType") as string;

      if (!title || !caseId) {
        return { success: false, error: "Title and case ID are required" };
      }

      try {
        const result = await discoveryApi.createEvidence({
          title,
          description: description || undefined,
          caseId,
          type: evidenceType || "Physical",
          status: "Pending Review",
          location: "Evidence Locker",
          custodian: "Evidence Clerk",
          tags: [],
          metadata: {
            collectedDate: new Date().toISOString(),
          },
        });

        if (!result.ok) {
          return { success: false, error: result.error.message };
        }

        return { success: true, message: "Evidence uploaded successfully" };
      } catch (error) {
        console.error("Failed to upload evidence:", error);
        return { success: false, error: "Failed to upload evidence" };
      }
    }
    case "delete": {
      const id = formData.get("id") as string;

      if (!id) {
        return { success: false, error: "Evidence ID is required" };
      }

      try {
        const result = await discoveryApi.removeEvidence(id);

        if (!result.ok) {
          return { success: false, error: result.error.message };
        }

        return { success: true, message: "Evidence deleted successfully" };
      } catch (error) {
        console.error("Failed to delete evidence:", error);
        return { success: false, error: "Failed to delete evidence" };
      }
    }
    case "transfer": {
      const id = formData.get("id") as string;
      const newCustodian = formData.get("custodian") as string;
      const reason = formData.get("reason") as string;

      if (!id || !newCustodian) {
        return { success: false, error: "Evidence ID and new custodian are required" };
      }

      try {
        const evidenceResult = await discoveryApi.getEvidenceById(id);

        if (!evidenceResult.ok) {
          return { success: false, error: evidenceResult.error.message };
        }

        const evidence = evidenceResult.data;

        const transferRecord = {
          from: evidence.custodian,
          to: newCustodian,
          timestamp: new Date().toISOString(),
          reason: reason || "Custody transfer",
        };

        const updateResult = await discoveryApi.updateEvidence(id, {
          custodian: newCustodian,
        });

        if (!updateResult.ok) {
          return { success: false, error: updateResult.error.message };
        }

        const chainResult = await discoveryApi.updateChainOfCustody(
          id,
          transferRecord
        );

        if (!chainResult.ok) {
          return { success: false, error: chainResult.error.message };
        }

        return { success: true, message: "Custody transferred successfully" };
      } catch (error) {
        console.error("Failed to transfer custody:", error);
        return { success: false, error: "Failed to transfer custody" };
      }
    }
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

import EvidenceVault from './components/EvidenceVault';

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
