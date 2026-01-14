/**
 * Docket Detail Route
 *
 * Displays detailed information for a single docket entry.
 *
 * @module routes/docket/detail
 */

import { docketApi } from '@/lib/frontend-api';
import { DocketDetail } from '@/routes/cases/components/docket/DocketDetail';
import type { CaseId } from '@/types';
import { useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { createDetailMeta } from '../_shared/meta-utils';
import { NotFoundError, RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: Awaited<ReturnType<typeof clientLoader>> }) {
  return createDetailMeta({
    entityType: 'Docket',
    entityName: data?.item?.title || data?.item?.description,
    entityId: data?.item?.id,
  });
}

// ============================================================================
// Loader - WITH PROPER PARAM VALIDATION
// ============================================================================

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { docketId } = params;

  // CRITICAL: Validate param exists
  if (!docketId) {
    throw new Response("Docket ID is required", { status: 400 });
  }

  // Ignore internal router requests or static assets that might be matched
  if (docketId === 'file' || docketId.endsWith('.data')) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    const result = await docketApi.getEntryById(docketId as CaseId);
    if (!result.ok) {
      throw new Response("Docket entry not found", { status: 404 });
    }
    return { item: result.data };
  } catch (error) {
    if ((error as { statusCode?: number })?.statusCode === 404) {
      throw new Response("Docket entry not found", { status: 404 });
    }
    console.error("Failed to load docket entry:", error);
    throw error;
  }
}

// Force client-side execution for hydration (needed for localStorage auth)
clientLoader.hydrate = true as const;

// ============================================================================
// Action
// ============================================================================

export async function action({ params, request }: ActionFunctionArgs) {
  const { docketId } = params;

  if (!docketId) {
    return { success: false, error: "Docket ID is required" };
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "update": {
      const entryNumber = formData.get("entryNumber") as string;
      const description = formData.get("description") as string;
      const filingDate = formData.get("filingDate") as string;

      const updates: Partial<{
        updatedAt: string;
        docketNumber: string;
        description: string;
        dateFiled: string;
      }> = {
        updatedAt: new Date().toISOString(),
      };

      if (entryNumber) updates.docketNumber = entryNumber;
      if (description) updates.description = description;
      if (filingDate) updates.dateFiled = filingDate;

      await DataService.docket.update(docketId, updates);
      return { success: true, message: "Docket entry updated successfully" };
    }
    case "update-content": {
      const text = formData.get("text") as string;
      // Note: File upload would separate API call in real implementation
      const updates = {
        text,
        updatedAt: new Date().toISOString()
      };
      await DataService.docket.update(docketId, updates);
      return { success: true, message: "Filing content updated successfully" };
    }
    case "update-metadata": {
      const appellateDataStr = formData.get("appellateData") as string;
      if (!appellateDataStr) {
        return { success: false, error: "Missing metadata" };
      }
      const appellateData = JSON.parse(appellateDataStr);
      await DataService.docket.update(docketId, { appellateData });
      return { success: true, message: "Metadata updated" };
    }
    case "delete": {
      await DataService.docket.delete(docketId);
      return {
        success: true,
        message: "Docket entry deleted successfully",
        redirect: "/docket"
      };
    }
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function DocketDetailRoute() {
  const { item } = useLoaderData() as Awaited<ReturnType<typeof clientLoader>>;

  // Pass the item to the feature component
  // The Feature component handles the View and Interactive logic (optimistic UI, tabs, etc)
  return <DocketDetail initialItem={item} />;
}

// ============================================================================

export function ErrorBoundary({ error }: { error: unknown }) {
  // Handle 404 specifically
  if (error instanceof Response && error.status === 404) {
    return (
      <NotFoundError
        title="Docket Not Found"
        message="The docket you're looking for doesn't exist."
        backTo="/docket"
        backLabel="Back to Docket"
      />
    );
  }

  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Docket"
      message="We couldn't load this docket. Please try again."
      backTo="/docket"
      backLabel="Back to Docket"
    />
  );
}
