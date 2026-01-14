/**
 * Docket & Filings Route
 *
 * Displays court filings, docket entries, and case schedules with:
 * - Server-side data loading via loader
 * - Filter and search capabilities
 * - File new motion/document actions via modal dialog
 *
 * @module routes/docket/index
 * @status PRODUCTION READY - No mock data, modal-based CRUD
 */

import { DataService } from '@/services/data/dataService';
import type { CaseId, PaginatedResponse } from '@/types';
import { useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import { DocketList } from './components/DocketList';
import type { DocketEntry } from './types/types';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: Awaited<ReturnType<typeof loader>> }) {
  return createListMeta({
    entityType: 'Docket Entries',
    count: data?.entries?.length,
    description: 'Manage court docket entries and filings',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || undefined;
  const type = url.searchParams.get("type") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1", 10);

  try {
    const response = await DataService.docket.getAll({ search, type, page });

    // Robust handling of API response structure
    let entries: DocketEntry[] = [];
    if (Array.isArray(response)) {
      entries = response;
    } else if (response && Array.isArray(response.data)) {
      const paginated = response as PaginatedResponse<DocketEntry>;
      entries = paginated.data;
    }

    return {
      entries,
      totalCount: (response as PaginatedResponse<DocketEntry>).total || entries.length || 0,
      page: (response as PaginatedResponse<DocketEntry>).page || 1,
      totalPages: (response as PaginatedResponse<DocketEntry>).totalPages || 1
    };
  } catch (error) {
    console.error("Failed to load docket entries:", error);
    throw error; // Let ErrorBoundary handle it
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
      case "file-motion": {
        const title = formData.get("title") as string;
        const caseId = formData.get("caseId") as string;
        const description = formData.get("description") as string;

        if (!title || !caseId) {
          return { success: false, error: "Missing required fields (Title, Case ID)" };
        }

        await DataService.docket.add({
          caseId: caseId as CaseId,
          title,
          description,
          dateFiled: new Date().toISOString(),
          entryDate: new Date().toISOString(),
          type: 'Motion',
          // Default values for required fields
          sequenceNumber: 0,
          docketNumber: 'PENDING'
        });

        return { success: true, message: "Motion filed successfully" };
      }

      case "delete": {
        const id = formData.get("id") as string;
        if (!id) return { success: false, error: "Missing ID" };

        await DataService.docket.delete(id);
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
  const data = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  return <DocketList {...data} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Docket"
      message="We couldn't load the docket entries. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
