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

import { docketApi } from '@/lib/frontend-api';
import type { CaseId } from '@/types';
import { useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import { DocketList } from './components/DocketList';

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
    // Fetch docket entries using new enterprise API
    const result = await docketApi.getAllEntries({ search, type, page, limit: 50 });

    if (!result.ok) {
      return {
        entries: [],
        totalCount: 0,
        page: 1,
        totalPages: 1
      };
    }

    return {
      entries: result.data.data,
      totalCount: result.data.total,
      page: result.data.page,
      totalPages: Math.ceil(result.data.total / result.data.pageSize)
    };
  } catch (error) {
    console.error("Failed to load docket entries:", error);
    return {
      entries: [],
      totalCount: 0,
      page: 1,
      totalPages: 1
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
