/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Docket Index Route
 *
 * Enterprise React Architecture - Docket Management
 * Exports loader and default component for React Router v7
 *
 * @module routes/docket/index
 */

import { useLoaderData } from 'react-router';

import { docketApi } from '@/lib/frontend-api';

import { createListMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';


// Import Page component
import { DocketPage } from './DocketPage';

import type { Route } from "./+types/index";
import type { clientLoader } from './loader';
import type { CaseId } from '@/types';

// Export loader
export { clientLoader as loader } from './loader';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Docket Entries',
    count: data?.docketEntries?.length,
    description: 'Manage court docket entries and filings',
  });
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "file-motion": {
        const title = formData.get("title") as string;
        const caseId = formData.get("caseId") as string;
        const description = formData.get("description") as string;

        if (!title || !caseId) {
          return { success: false, error: "Missing required fields (Title, Case ID)" };
        }

        const result = await docketApi.create({
          caseId: caseId as CaseId,
          title,
          description,
          dateFiled: new Date().toISOString(),
          entryDate: new Date().toISOString(),
          type: 'Motion',
          sequenceNumber: 0,
          docketNumber: 'PENDING'
        });

        if (!result.ok) {
          return { success: false, error: result.error.message };
        }

        return { success: true, message: "Motion filed successfully" };
      }

      case "delete": {
        const id = formData.get("id") as string;
        if (!id) return { success: false, error: "Missing ID" };

        const result = await docketApi.remove(id);
        if (!result.ok) {
          return { success: false, error: result.error.message };
        }
        return { success: true, message: "Entry deleted" };
      }

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

export default function DocketIndexRoute() {
  const loaderData = useLoaderData();

  return <DocketPage loaderData={loaderData} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
